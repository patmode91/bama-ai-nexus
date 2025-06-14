
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumCategory, ForumTopic, ForumReply, CreateTopicData, CreateReplyData } from '@/types/forums';

export const useForums = () => {
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Get topics with author and category info
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['forum-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          author:profiles!forum_topics_author_id_fkey(full_name, company),
          category:forum_categories!forum_topics_category_id_fkey(name, color)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match expected types
      return data?.map(topic => ({
        ...topic,
        author: topic.author || { full_name: 'Anonymous', company: '' },
        category: topic.category || { name: 'General', color: '#3B82F6' }
      })) as ForumTopic[];
    },
  });

  // Get replies for a specific topic
  const getReplies = async (topicId: string): Promise<ForumReply[]> => {
    const { data, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey(full_name, company),
        upvotes:forum_votes!left(vote_type)
      `)
      .eq('topic_id', topicId)
      .order('created_at');
    
    if (error) throw error;
    
    // Transform data to match expected types
    return data?.map(reply => ({
      ...reply,
      author: reply.author || { full_name: 'Anonymous', company: '' },
      upvotes: reply.upvotes?.filter((vote: any) => vote.vote_type === 'up').length || 0,
      user_vote: null
    })) as ForumReply[];
  };

  // Get single topic
  const getTopic = async (topicId: string): Promise<ForumTopic | null> => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        author:profiles!forum_topics_author_id_fkey(full_name, company),
        category:forum_categories!forum_topics_category_id_fkey(name, color)
      `)
      .eq('id', topicId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      author: data.author || { full_name: 'Anonymous', company: '' },
      category: data.category || { name: 'General', color: '#3B82F6' }
    } as ForumTopic;
  };

  // Get topics by category
  const getTopics = async (categoryId?: string): Promise<ForumTopic[]> => {
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        author:profiles!forum_topics_author_id_fkey(full_name, company),
        category:forum_categories!forum_topics_category_id_fkey(name, color)
      `);
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(topic => ({
      ...topic,
      author: topic.author || { full_name: 'Anonymous', company: '' },
      category: topic.category || { name: 'General', color: '#3B82F6' }
    })) as ForumTopic[];
  };

  // Create topic mutation
  const createTopic = useMutation({
    mutationFn: async (data: CreateTopicData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data: newTopic, error } = await supabase
        .from('forum_topics')
        .insert({
          ...data,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newTopic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast({
        title: "Topic created",
        description: "Your topic has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating topic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create reply mutation
  const createReply = useMutation({
    mutationFn: async (data: CreateReplyData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data: newReply, error } = await supabase
        .from('forum_replies')
        .insert({
          ...data,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newReply;
    },
    onSuccess: () => {
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error posting reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vote function
  const vote = async (targetId: string, targetType: 'topic' | 'reply', voteType: 'up' | 'down') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      const voteData: any = {
        user_id: user.id,
        vote_type: voteType,
      };

      if (targetType === 'topic') {
        voteData.topic_id = targetId;
      } else {
        voteData.reply_id = targetId;
      }

      const { error } = await supabase
        .from('forum_votes')
        .upsert(voteData, {
          onConflict: targetType === 'topic' ? 'user_id,topic_id' : 'user_id,reply_id'
        });

      if (error) throw error;

      toast({
        title: "Vote recorded",
        description: `Your ${voteType}vote has been recorded.`,
      });
    } catch (error: any) {
      toast({
        title: "Error voting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return {
    categories,
    categoriesLoading,
    topics,
    topicsLoading,
    createTopic: createTopic.mutate,
    createReply: createReply.mutate,
    getReplies,
    getTopic,
    getTopics,
    vote,
    isVoting,
  };
};
