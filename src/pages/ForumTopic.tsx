
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import TopicView from '@/components/forums/TopicView';

const ForumTopic = () => {
  const { id } = useParams<{ id: string }>();

  const { data: topic, isLoading } = useQuery({
    queryKey: ['forum-topic', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories(name, color),
          profiles(full_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-6">
        {topic && <TopicView topic={topic} />}
      </main>
      
      <Footer />
    </div>
  );
};

export default ForumTopic;
