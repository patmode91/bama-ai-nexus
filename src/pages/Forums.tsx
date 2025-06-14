
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import ForumCard from '@/components/forums/ForumCard';
import TopicView from '@/components/forums/TopicView';
import CreateTopicForm from '@/components/forums/CreateTopicForm';
import SEO from '@/components/seo/SEO';
import { useForums } from '@/hooks/useForums';
import { ForumTopic, ForumReply } from '@/types/forums';

const Forums = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { categories, categoriesLoading, topics, topicsLoading, getTopic, getReplies } = useForums();
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<ForumTopic | null>(null);
  const [currentReplies, setCurrentReplies] = useState<ForumReply[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);

  // Load topic and replies when topicId changes
  useEffect(() => {
    if (topicId) {
      loadTopicAndReplies(topicId);
    } else {
      setCurrentTopic(null);
      setCurrentReplies([]);
    }
  }, [topicId]);

  const loadTopicAndReplies = async (id: string) => {
    setTopicLoading(true);
    setRepliesLoading(true);
    
    try {
      const [topic, replies] = await Promise.all([
        getTopic(id),
        getReplies(id)
      ]);
      
      setCurrentTopic(topic);
      setCurrentReplies(replies);
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setTopicLoading(false);
      setRepliesLoading(false);
    }
  };

  const filteredTopics = selectedCategory
    ? topics.filter(topic => topic.category_id === selectedCategory)
    : topics;

  if (topicId && currentTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <SEO 
          title={`${currentTopic.title} - Forums`}
          description={`Join the discussion about ${currentTopic.title} in Alabama's AI community forums`}
        />
        <Header />
        <div className="container mx-auto px-6 py-16">
          <TopicView 
            topic={currentTopic}
            replies={currentReplies}
            isLoading={topicLoading || repliesLoading}
            onBack={() => navigate('/forums')}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="Community Forums"
        description="Connect with Alabama's AI community. Share insights, ask questions, and collaborate on the future of artificial intelligence."
      />
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <MessageSquare className="w-10 h-10 text-[#00C2FF]" />
            Community Forums
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with Alabama's AI community. Share insights, ask questions, and collaborate.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00C2FF]" />
                Active Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{topics.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{categories.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {topics.filter(t => 
                  new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <Button 
                  onClick={() => setShowCreateTopic(true)}
                  className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Topic
                </Button>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('')}
                >
                  All Topics
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Topics List */}
          <div className="lg:col-span-3">
            {topicsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading topics...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <ForumCard 
                    key={topic.id} 
                    topic={topic}
                    onClick={() => navigate(`/forums/${topic.id}`)}
                  />
                ))}
                
                {filteredTopics.length === 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-8 text-center">
                      <div className="text-gray-400">No topics found</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CreateTopicForm 
            categories={categories}
            onClose={() => setShowCreateTopic(false)}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Forums;
