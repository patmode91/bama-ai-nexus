
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, MessageSquare, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import SEO from '@/components/seo/SEO';
import ForumCard from '@/components/forums/ForumCard';
import CreateTopicForm from '@/components/forums/CreateTopicForm';
import TopicView from '@/components/forums/TopicView';
import { useForums } from '@/hooks/useForums';

const Forums = () => {
  const { categories, categoriesLoading, getTopics, getTopic, getReplies } = useForums();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  const { data: topics = [], isLoading: topicsLoading } = getTopics(selectedCategory || undefined);
  const { data: selectedTopic } = getTopic(selectedTopicId);
  const { data: replies = [] } = getReplies(selectedTopicId);

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedTopicId && selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <SEO 
          title={selectedTopic.title}
          description={selectedTopic.content.substring(0, 160)}
        />
        <Header />
        <main className="container mx-auto px-6 py-8">
          <TopicView
            topic={selectedTopic}
            replies={replies}
            onBack={() => setSelectedTopicId('')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="Discussion Forums"
        description="Join the conversation with Alabama's AI community. Share insights, ask questions, and connect with fellow entrepreneurs and tech enthusiasts."
      />
      
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Community Forums</h1>
          <p className="text-gray-300 text-lg">
            Connect with Alabama's AI community. Share insights, ask questions, and learn from fellow entrepreneurs.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-[#00C2FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{topics.length}</div>
              <div className="text-gray-400">Active Topics</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-[#00C2FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{categories.length}</div>
              <div className="text-gray-400">Categories</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-[#00C2FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {topics.reduce((sum, topic) => sum + (topic.reply_count || 0), 0)}
              </div>
              <div className="text-gray-400">Total Replies</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className="mb-2"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="mb-2"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={createTopicOpen} onOpenChange={setCreateTopicOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00C2FF] hover:bg-[#0099CC]">
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <CreateTopicForm
                onSuccess={() => setCreateTopicOpen(false)}
                initialCategoryId={selectedCategory}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topicsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading topics...</div>
            </div>
          ) : filteredTopics.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No topics found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to start a discussion!'}
                </p>
                <Dialog open={createTopicOpen} onOpenChange={setCreateTopicOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00C2FF] hover:bg-[#0099CC]">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Topic
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            filteredTopics.map((topic) => (
              <ForumCard
                key={topic.id}
                topic={topic}
                onClick={() => setSelectedTopicId(topic.id)}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Forums;
