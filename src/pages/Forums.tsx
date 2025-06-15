
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import ForumCard from '@/components/forums/ForumCard';
import CreateTopicForm from '@/components/forums/CreateTopicForm';
import TopicView from '@/components/forums/TopicView';
import { useForums } from '@/hooks/useForums';
import { ForumTopic, ForumReply } from '@/types/forums';

const Forums = () => {
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const { 
    categories, 
    categoriesLoading, 
    topics, 
    topicsLoading, 
    getReplies, 
    getTopic,
    getTopics 
  } = useForums();

  const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([]);

  useEffect(() => {
    let filtered = topics;

    if (selectedCategoryId) {
      filtered = filtered.filter(topic => topic.category_id === selectedCategoryId);
    }

    if (searchQuery) {
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTopics(filtered);
  }, [topics, selectedCategoryId, searchQuery]);

  const handleTopicClick = async (topic: ForumTopic) => {
    setSelectedTopic(topic);
    setIsLoadingReplies(true);
    try {
      const topicReplies = await getReplies(topic.id);
      setReplies(topicReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleBackToForums = () => {
    setSelectedTopic(null);
    setReplies([]);
  };

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Helmet>
          <title>{selectedTopic.title} - Alabama Business Forums</title>
        </Helmet>
        
        <Header />
        
        <main className="py-8">
          <div className="container mx-auto px-6">
            <TopicView
              topic={selectedTopic}
              replies={replies}
              isLoading={isLoadingReplies}
              onBack={handleBackToForums}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Helmet>
        <title>Business Forums - Alabama Business Directory</title>
        <meta name="description" content="Connect with Alabama business community. Share insights, ask questions, and network with local entrepreneurs." />
      </Helmet>
      
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Business Forums
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connect with Alabama's business community. Share insights, ask questions, 
              and network with local entrepreneurs and industry experts.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-[#00C2FF] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{topics.length}</div>
                <div className="text-sm text-gray-400">Active Topics</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-gray-400">Community Members</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">89</div>
                <div className="text-sm text-gray-400">Topics This Week</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400">Active Community</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategoryId === '' ? 'default' : 'secondary'}
                className={`cursor-pointer ${
                  selectedCategoryId === '' 
                    ? 'bg-[#00C2FF] text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCategoryId('')}
              >
                All Categories
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategoryId === category.id ? 'default' : 'secondary'}
                  className={`cursor-pointer ${
                    selectedCategoryId === category.id 
                      ? 'bg-[#00C2FF] text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Create Topic Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <CreateTopicForm
                categories={categories}
                onClose={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {/* Topics List */}
          <div className="space-y-4">
            {topicsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading topics...</div>
              </div>
            ) : filteredTopics.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No topics found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchQuery || selectedCategoryId 
                      ? 'No topics match your current filters.' 
                      : 'Be the first to start a discussion!'
                    }
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Topic
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredTopics.map((topic) => (
                <ForumCard
                  key={topic.id}
                  topic={topic}
                  onClick={() => handleTopicClick(topic)}
                />
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Forums;
