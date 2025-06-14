
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumCategory, ForumTopic, ForumReply, CreateTopicData, CreateReplyData } from '@/types/forums';

export const useForumCategories = () => {
  return useQuery({
    queryKey: ['forum-categories'],
    queryFn: async (): Promise<ForumCategory[]> => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching forum categories:', error);
        throw error;
      }

      return data;
    },
  });
};

export const useForumTopics = (categoryId?: string) => {
  return useQuery({
    queryKey: ['forum-topics', categoryId],
    queryFn: async (): Promise<ForumTopic[]> => {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories!inner(name, color),
          profiles!forum_topics_author_id_fkey(full_name, company)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching forum topics:', error);
        throw error;
      }

      // Get reply counts and last reply info for each topic
      const topicsWithStats = await Promise.all(
        data.map(async (topic) => {
          const { count: replyCount } = await supabase
            .from('forum_replies')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          const { data: lastReply } = await supabase
            .from('forum_replies')
            .select('created_at')
            .eq('topic_id', topic.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...topic,
            author: topic.profiles || { full_name: 'Unknown User', company: '' },
            category: topic.forum_categories,
            reply_count: replyCount || 0,
            last_reply_at: lastReply?.created_at || topic.created_at,
          };
        })
      );

      return topicsWithStats;
    },
  });
};

export const useForumTopic = (topicId: string) => {
  return useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async () => {
      const { data: topic, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories!inner(name, color),
          profiles!forum_topics_author_id_fkey(full_name, company)
        `)
        .eq('id', topicId)
        .single();

      if (error) {
        console.error('Error fetching forum topic:', error);
        throw error;
      }

      return {
        ...topic,
        author: topic.profiles || { full_name: 'Unknown User', company: '' },
        category: topic.forum_categories,
      };
    },
  });
};

export const useForumReplies = (topicId: string) => {
  return useQuery({
    queryKey: ['forum-replies', topicId],
    queryFn: async (): Promise<ForumReply[]> => {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          profiles!forum_replies_author_id_fkey(full_name, company)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching forum replies:', error);
        throw error;
      }

      // Get vote counts and user votes for each reply
      const { data: { user } } = await supabase.auth.getUser();
      
      const repliesWithVotes = await Promise.all(
        data.map(async (reply) => {
          const { count: upvotes } = await supabase
            .from('forum_votes')
            .select('*', { count: 'exact', head: true })
            .eq('reply_id', reply.id)
            .eq('vote_type', 'up');

          let userVote = null;
          if (user) {
            const { data: vote } = await supabase
              .from('forum_votes')
              .select('vote_type')
              .eq('reply_id', reply.id)
              .eq('user_id', user.id)
              .single();
            userVote = vote;
          }

          return {
            ...reply,
            author: reply.profiles || { full_name: 'Unknown User', company: '' },
            upvotes: upvotes || 0,
            user_vote: userVote,
          };
        })
      );

      return repliesWithVotes;
    },
  });
};

export const useCreateTopic = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicData: CreateTopicData) => {
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
};

export const useCreateReply = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyData: CreateReplyData) => {
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
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', variables.topic_id] });
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
};

export const useVoteReply = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ replyId, voteType }: { replyId: string; voteType: 'up' | 'down' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('forum_votes')
        .upsert({
          user_id: user.id,
          reply_id: replyId,
          vote_type: voteType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Find which topic this reply belongs to and invalidate its queries
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
};
