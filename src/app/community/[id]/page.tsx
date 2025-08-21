
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCommunity } from '@/contexts/community-context';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { Post, Comment } from '@/lib/types';

export default function CommunityPostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const { user, isAuthenticated } = useAuth();
  const { getPostById, toggleLike, addComment, isLikedBy } = useCommunity();

  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const postData = getPostById(postId);
    if (postData) {
      setPost(postData);
    } else {
      // Handle post not found, maybe redirect
    }
  }, [postId, getPostById]);
  
  useEffect(() => {
    if (user && post) {
      setIsLiked(isLikedBy(post.id, user.id));
    } else {
      setIsLiked(false);
    }
  }, [user, post, isLikedBy]);

  const handleToggleLike = () => {
    if (!isAuthenticated || !user || !post) {
      router.push('/login');
      return;
    }
    // Optimistic UI update
    setPost(p => {
        if (!p) return null;
        const newIsLiked = !isLikedBy(p.id, user.id);
        const newLikeCount = newIsLiked ? p.likeCount + 1 : p.likeCount - 1;
        return { ...p, likeCount: newLikeCount };
    });
    toggleLike(post.id, user.id);
  };
  
  const handleAddComment = () => {
    if (!isAuthenticated || !user || !post || !newComment.trim()) {
      if (!isAuthenticated) router.push('/login');
      return;
    }
    
    const commentData: Omit<Comment, 'id' | 'createdAt'> = {
      user: {
        uid: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      text: newComment,
    };
    
    addComment(post.id, commentData);
    setNewComment('');
  };

  if (!post) {
    return <div className="container mx-auto py-8 text-center">게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{post.author.nickname.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{post.author.nickname}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6">
            {post.images && post.images.length > 0 && (
                <Carousel className="mb-6 rounded-lg overflow-hidden">
                    <CarouselContent>
                        {post.images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-video">
                                    <Image src={image.url} alt={`Post image ${index + 1}`} fill className="object-contain" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                     {post.images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                        </>
                    )}
                </Carousel>
            )}
          <div className="prose dark:prose-invert max-w-none break-words">
            <p>{post.content}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 border-t pt-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleToggleLike} className="flex items-center gap-2">
              <Heart className={`w-5 h-5 ${isLikedBy(post.id, user?.id || '') ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
              <span>좋아요 {post.likeCount}</span>
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-5 h-5" />
              <span>댓글 {post.commentCount}</span>
            </div>
          </div>
          
          {/* Comment Section */}
          <div className="w-full space-y-4">
            {isAuthenticated ? (
                <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 mt-1">
                        <AvatarFallback>{user?.nickname?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <Textarea 
                            placeholder="따뜻한 댓글을 남겨주세요."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={2}
                        />
                        <div className="mt-2 flex justify-end">
                            <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
                                <Send className="mr-2 h-4 w-4" />
                                등록
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">댓글을 작성하려면 <Link href="/login" className="text-primary underline">로그인</Link>이 필요합니다.</p>
                </div>
            )}
            
            <div className="space-y-6">
              {post.comments?.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{comment.user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{comment.user.nickname}</p>
                            <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-foreground mt-1">{comment.text}</p>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
