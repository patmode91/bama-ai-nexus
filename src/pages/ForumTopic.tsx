
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TopicView from '@/components/forums/TopicView';

const ForumTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTopic();
      fetchReplies();
    }
  }, [id]);

  const fetchTopic = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories (
            name,
            color
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch profile separately to avoid relation errors
      if (data?.author_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.author_id)
          .single();
        
        const topicWithProfile = {
          ...data,
          profiles: profile || { full_name: 'Anonymous' }
        };
        
        setTopic(topicWithProfile);
      } else {
        setTopic(data);
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast.error('Failed to load topic');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for replies
      const repliesWithProfiles = await Promise.all(
        (data || []).map(async (reply) => {
          if (reply.author_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', reply.author_id)
              .single();
            
            return {
              ...reply,
              profiles: profile || { full_name: 'Anonymous' }
            };
          }
          return {
            ...reply,
            profiles: { full_name: 'Anonymous' }
          };
        })
      );

      setReplies(repliesWithProfiles);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to reply');
        return;
      }

      const { error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: id,
          content: newReply,
          author_id: user.id
        });

      if (error) throw error;

      setNewReply('');
      fetchReplies();
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-600 rounded w-1/3"></div>
            <div className="h-32 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 p-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Topic Not Found</h1>
          <Button onClick={() => navigate('/forum')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 p-6">
      <div className="container mx-auto max-w-4xl">
        <TopicView
          topic={topic}
          replies={replies}
          onBack={() => navigate('/forum')}
        />

        {/* Reply Form */}
        <Card className="mt-8 bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Add a Reply
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write your reply..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !newReply.trim()}
                className="bg-[#00C2FF] hover:bg-[#0099CC]"
              >
                {isSubmitting ? (
                  'Posting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumTopic;
