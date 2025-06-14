import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumCategory, ForumTopic, ForumReply, CreateTopicData, CreateReplyData } from '@/types/forums';

export const useForums = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async (): Promise<ForumCategory[]> => {
      console.log('Fetching forum categories...');
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data;
    },
  });

  const getTopics = (categoryId?: string) => {
    return useQuery({
      queryKey: ['forum-topics', categoryId],
      queryFn: async (): Promise<ForumTopic[]> => {
        console.log('Fetching forum topics for category:', categoryId);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            profiles!forum_topics_author_id_fkey (
              full_name,
              company
            ),
            forum_categories (
              name,
              color
            )
          `)
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching topics:', error);
          throw error;
        }

        // Get additional data for each topic
        const topicsWithDetails = await Promise.all(
          data.map(async (topic) => {
            // Get reply count
            const { count: replyCount } = await supabase
              .from('forum_replies')
              .select('*', { count: 'exact', head: true })
              .eq('topic_id', topic.id);

            // Get last reply date
            const { data: lastReply } = await supabase
              .from('forum_replies')
              .select('created_at')
              .eq('topic_id', topic.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Get upvotes count
            const { count: upvotesCount } = await supabase
              .from('forum_votes')
              .select('*', { count: 'exact', head: true })
              .eq('topic_id', topic.id)
              .eq('vote_type', 'up');

            const { count: downvotesCount } = await supabase
              .from('forum_votes')
              .select('*', { count: 'exact', head: true })
              .eq('topic_id', topic.id)
              .eq('vote_type', 'down');

            // Get user's vote if logged in
            let userVote = null;
            if (user) {
              const { data: vote } = await supabase
                .from('forum_votes')
                .select('vote_type')
                .eq('topic_id', topic.id)
                .eq('user_id', user.id)
                .single();
              userVote = vote?.vote_type || null;
            }

            return {
              ...topic,
              author: topic.profiles,
              category: topic.forum_categories,
              reply_count: replyCount || 0,
              last_reply_at: lastReply?.created_at || topic.created_at,
              upvotes: (upvotesCount || 0) - (downvotesCount || 0),
              user_vote: userVote,
            };
          })
        );

        return topicsWithDetails;
      },
    });
  };

  const getTopic = (topicId: string) => {
    return useQuery({
      queryKey: ['forum-topic', topicId],
      queryFn: async (): Promise<ForumTopic | null> => {
        if (!topicId) return null;
        
        console.log('Fetching forum topic:', topicId);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles!forum_topics_author_id_fkey (
              full_name,
              company
            ),
            forum_categories (
              name,
              color
            )
          `)
          .eq('id', topicId)
          .single();

        if (error) {
          console.error('Error fetching topic:', error);
          throw error;
        }

        // Increment view count
        await supabase
          .from('forum_topics')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', topicId);

        // Get upvotes
        const { count: upvotesCount } = await supabase
          .from('forum_votes')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topicId)
          .eq('vote_type', 'up');

        const { count: downvotesCount } = await supabase
          .from('forum_votes')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topicId)
          .eq('vote_type', 'down');

        // Get user's vote if logged in
        let userVote = null;
        if (user) {
          const { data: vote } = await supabase
            .from('forum_votes')
            .select('vote_type')
            .eq('topic_id', topicId)
            .eq('user_id', user.id)
            .single();
          userVote = vote?.vote_type || null;
        }

        return {
          ...data,
          author: data.profiles,
          category: data.forum_categories,
          upvotes: (upvotesCount || 0) - (downvotesCount || 0),
          user_vote: userVote,
        };
      },
      enabled: !!topicId,
    });
  };

  const getReplies = (topicId: string) => {
    return useQuery({
      queryKey: ['forum-replies', topicId],
      queryFn: async (): Promise<ForumReply[]> => {
        if (!topicId) return [];
        
        console.log('Fetching replies for topic:', topicId);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('forum_replies')
          .select(`
            *,
            profiles!forum_replies_author_id_fkey (
              full_name,
              company
            )
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching replies:', error);
          throw error;
        }

        // Get votes for each reply
        const repliesWithVotes = await Promise.all(
          data.map(async (reply) => {
            const { count: upvotesCount } = await supabase
              .from('forum_votes')
              .select('*', { count: 'exact', head: true })
              .eq('reply_id', reply.id)
              .eq('vote_type', 'up');

            const { count: downvotesCount } = await supabase
              .from('forum_votes')
              .select('*', { count: 'exact', head: true })
              .eq('reply_id', reply.id)
              .eq('vote_type', 'down');

            let userVote = null;
            if (user) {
              const { data: vote } = await supabase
                .from('forum_votes')
                .select('vote_type')
                .eq('reply_id', reply.id)
                .eq('user_id', user.id)
                .single();
              userVote = vote?.vote_type || null;
            }

            return {
              ...reply,
              author: reply.profiles,
              upvotes: (upvotesCount || 0) - (downvotesCount || 0),
              user_vote: userVote,
            };
          })
        );

        return repliesWithVotes;
      },
      enabled: !!topicId,
    });
  };

  const createTopicMutation = useMutation({
    mutationFn: async (topicData: CreateTopicData) => {
      console.log('Creating topic:', topicData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          ...topicData,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast({
        title: "Topic created",
        description: "Your topic has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (replyData: CreateReplyData) => {
      console.log('Creating reply:', replyData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          ...replyData,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update topic's updated_at timestamp
      await supabase
        .from('forum_topics')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', replyData.topic_id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', data.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ 
      type, 
      targetId, 
      voteType, 
      currentVote 
    }: { 
      type: 'topic' | 'reply'; 
      targetId: string; 
      voteType: 'up' | 'down';
      currentVote?: 'up' | 'down' | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // If user already voted the same way, remove the vote
      if (currentVote === voteType) {
        const { error } = await supabase
          .from('forum_votes')
          .delete()
          .eq('user_id', user.id)
          .eq(type === 'topic' ? 'topic_id' : 'reply_id', targetId);
        
        if (error) throw error;
        return;
      }

      // Otherwise, upsert the vote
      const voteData = {
        user_id: user.id,
        vote_type: voteType,
        ...(type === 'topic' ? { topic_id: targetId } : { reply_id: targetId })
      };

      const { error } = await supabase
        .from('forum_votes')
        .upsert(voteData, { 
          onConflict: `user_id,${type}_id`
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic'] });
      queryClient.invalidateQueries({ queryKey: ['forum-replies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    categories,
    categoriesLoading,
    getTopics,
    getTopic,
    getReplies,
    createTopic: createTopicMutation.mutate,
    isCreatingTopic: createTopicMutation.isPending,
    createReply: createReplyMutation.mutate,
    isCreatingReply: createReplyMutation.isPending,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
};
