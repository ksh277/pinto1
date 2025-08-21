
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/contexts/community-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/contexts/i18n-context';
import { Plus, X, Image as ImageIcon, Heart, MessageCircle } from 'lucide-react';
import type { Post } from '@/lib/types';
import Link from 'next/link';

export default function CommunityPage() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const { posts, addPost } = useCommunity();

  const [showForm, setShowForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 5 - newPostImages.length;
      if (files.length > remainingSlots) {
        // Optionally show a toast message
      }
      const filesToUpload = files.slice(0, remainingSlots);

      setNewPostImages(prev => [...prev, ...filesToUpload]);

      const newPreviews = filesToUpload.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
        const urlToRemove = prev[index];
        URL.revokeObjectURL(urlToRemove);
        return prev.filter((_, i) => i !== index)
    });
  }

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    const newPost: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'comments'> = {
      author: {
        uid: user.id,
        nickname: user.nickname || '익명',
        avatarUrl: user.avatarUrl,
      },
      content: newPostContent,
      images: imagePreviews.map(url => ({ url, thumbUrl: url, w: 500, h: 500})),
    };

    addPost(newPost);
    setNewPostContent('');
    setNewPostImages([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setShowForm(false);
  };
  
  const sortedPosts = [...posts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">커뮤니티</h1>
        {isAuthenticated && (
            <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="mr-2 h-4 w-4" />
                새 글 작성하기
            </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">새 글 작성</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePostSubmit}>
              <Textarea
                placeholder="자유롭게 이야기를 나눠보세요."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-4"
                rows={4}
              />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  이미지 첨부 (최대 5개)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image src={preview} alt={`preview ${index}`} fill className="rounded-md object-cover"/>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {newPostImages.length < 5 && (
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                           <ImageIcon className="h-8 w-8 text-muted-foreground" />
                           <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                           />
                        </label>
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                 <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={!newPostContent.trim()}>
                    글 등록
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedPosts.length > 0 ? sortedPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`} className="group block">
            <Card className="flex flex-col h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                {post.images && post.images.length > 0 && (
                     <div className="relative aspect-square w-full overflow-hidden">
                        <Image src={post.images[0].url} alt={post.content} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" fill/>
                    </div>
                )}
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pt-4">
                  <Avatar>
                    <AvatarFallback>{post.author.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{post.author.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow py-2">
                  <p className="text-sm line-clamp-3">{post.content}</p>
                </CardContent>
                <CardFooter className="flex gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Heart className="w-4 h-4"/> 
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <MessageCircle className="w-4 h-4"/> 
                    <span>{post.commentCount}</span>
                  </div>
                </CardFooter>
            </Card>
          </Link>
        )) : (
            <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">아직 작성된 글이 없습니다. 첫 글을 작성해보세요!</p>
            </div>
        )}
      </div>
    </div>
  );
}
