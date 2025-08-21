
'use client';

import { createContext, useContext, type ReactNode, useMemo, useCallback, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Post, Comment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Mock initial data with dates as strings to be serializable
const initialPosts: (Omit<Post, 'createdAt' | 'updatedAt' | 'comments'> & { createdAt: string, updatedAt: string, comments: (Omit<Comment, 'createdAt'> & { createdAt: string })[] })[] = [
  {
    id: '1',
    author: { uid: 'user_123', nickname: 'pinto_master', avatarUrl: undefined },
    content: '포토카드 홀더 꾸미기 꿀팁 대방출! ✨ 다들 자기만의 포카홀더 꾸미는 방법이 있나요? 댓글로 공유해주세요!',
    likeCount: 128,
    commentCount: 2,
    createdAt: new Date('2024-05-20T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-05-20T10:00:00Z').toISOString(),
    images: [{ url: 'https://placehold.co/600x400.png', thumbUrl: 'https://placehold.co/600x400.png', w: 600, h: 400 }],
    comments: [
        { id: 'c1', user: { uid: 'user_abc', nickname: '꾸미기장인' }, text: '저는 스티커랑 체인을 주로 사용해요! 반짝반짝해서 예뻐요.', createdAt: new Date('2024-05-20T11:00:00Z').toISOString() },
        { id: 'c2', user: { uid: 'user_def', nickname: '포카수집가' }, text: '탑로더에 레진으로 꾸미는 것도 추천합니다!', createdAt: new Date('2024-05-20T11:30:00Z').toISOString() },
    ]
  },
  {
    id: '2',
    author: { uid: 'user_456', nickname: 'goods_lover', avatarUrl: undefined },
    content: '이번에 새로 주문한 아크릴 스탠드 도착! 퀄리티 너무 좋아서 만족도 200%입니다 😭',
    likeCount: 76,
    commentCount: 0,
    createdAt: new Date('2024-05-20T09:30:00Z').toISOString(),
    updatedAt: new Date('2024-05-20T09:30:00Z').toISOString(),
    images: [{ url: 'https://placehold.co/600x400.png', thumbUrl: 'https://placehold.co/600x400.png', w: 600, h: 400 }],
    comments: [],
  },
];

const deserializePosts = (serializedPosts: any[]): Post[] => {
    if (!Array.isArray(serializedPosts)) return [];
    return serializedPosts.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        comments: (p.comments || []).map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) }))
    }));
}


interface CommunityContextType {
  posts: Post[];
  getPostById: (id: string) => Post | undefined;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'comments'>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  isLikedBy: (postId: string, userId: string) => boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useLocalStorage<Post[]>('community_posts', deserializePosts(initialPosts));
  const { toast } = useToast();
  const [likes, setLikes] = useLocalStorage<Record<string, string[]>>('community_likes', { '1': ['user_123'] });

  const getPostById = useCallback((id: string) => {
    return posts.find(p => p.id === id);
  }, [posts]);

  const addPost = useCallback((postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'comments'>) => {
    const newPost: Post = {
      ...postData,
      id: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
    toast({
      title: '게시물 작성 완료',
      description: '새로운 글이 성공적으로 등록되었습니다.',
    });
  }, [setPosts, toast]);
  
  const isLikedBy = useCallback((postId: string, userId: string) => {
    return !!likes[postId]?.includes(userId);
  }, [likes]);

  const toggleLike = useCallback((postId: string, userId: string) => {
    const postExists = posts.some(p => p.id === postId);
    if (!postExists) return;

    const liked = isLikedBy(postId, userId);

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const newLikeCount = liked ? p.likeCount - 1 : p.likeCount + 1;
          return { ...p, likeCount: newLikeCount < 0 ? 0 : newLikeCount };
        }
        return p;
      })
    );

    setLikes(prevLikes => {
        const postLikes = prevLikes[postId] || [];
        if (postLikes.includes(userId)) {
            return {...prevLikes, [postId]: postLikes.filter(uid => uid !== userId)};
        } else {
            return {...prevLikes, [postId]: [...postLikes, userId]};
        }
    });

  }, [posts, setPosts, setLikes, isLikedBy]);

  const addComment = useCallback((postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
      setPosts(prevPosts => 
        prevPosts.map(p => {
            if (p.id === postId) {
                const newComment: Comment = {
                    ...commentData,
                    id: `c${Date.now()}`,
                    createdAt: new Date(),
                };
                return {
                    ...p,
                    comments: [...(p.comments || []), newComment],
                    commentCount: (p.commentCount || 0) + 1,
                }
            }
            return p;
        })
      );
  }, [setPosts]);
  
  const value = useMemo(() => ({ 
    posts,
    getPostById,
    addPost,
    toggleLike,
    addComment,
    isLikedBy,
  }), [posts, getPostById, addPost, toggleLike, addComment, isLikedBy]);

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
