
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Search, TrendingUp, MessageSquare, Lock, Globe } from 'lucide-react';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  category: string;
  isPrivate: boolean;
  isMember: boolean;
  moderators: string[];
  recentActivity: string;
  tags: string[];
  avatar?: string;
}

const mockGroups: CommunityGroup[] = [
  {
    id: '1',
    name: 'Alabama Tech Entrepreneurs',
    description: 'A community for tech entrepreneurs across Alabama to share insights, collaborate, and grow together.',
    memberCount: 342,
    postCount: 1205,
    category: 'Technology',
    isPrivate: false,
    isMember: true,
    moderators: ['Sarah Chen', 'Mike Johnson'],
    recentActivity: '2 hours ago',
    tags: ['technology', 'startups', 'entrepreneurship', 'AI']
  },
  {
    id: '2',
    name: 'Birmingham Business Network',
    description: 'Local Birmingham business owners connecting and supporting each other.',
    memberCount: 567,
    postCount: 892,
    category: 'Local Business',
    isPrivate: false,
    isMember: false,
    moderators: ['Emily Davis'],
    recentActivity: '4 hours ago',
    tags: ['birmingham', 'local-business', 'networking']
  },
  {
    id: '3',
    name: 'Alabama Manufacturing Alliance',
    description: 'Private group for manufacturing companies in Alabama to discuss industry trends and challenges.',
    memberCount: 89,
    postCount: 234,
    category: 'Manufacturing',
    isPrivate: true,
    isMember: false,
    moderators: ['Robert Smith', 'Lisa Johnson'],
    recentActivity: '1 day ago',
    tags: ['manufacturing', 'industry', 'supply-chain']
  },
  {
    id: '4',
    name: 'Women in Business Alabama',
    description: 'Supporting and empowering women business leaders throughout Alabama.',
    memberCount: 423,
    postCount: 756,
    category: 'Professional Development',
    isPrivate: false,
    isMember: true,
    moderators: ['Jennifer Martinez', 'Amanda Wilson'],
    recentActivity: '3 hours ago',
    tags: ['women-in-business', 'leadership', 'empowerment']
  }
];

const CommunityGroups = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>(mockGroups);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('my-groups');

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            isMember: !group.isMember,
            memberCount: group.isMember ? group.memberCount - 1 : group.memberCount + 1
          }
        : group
    ));
  };

  const myGroups = groups.filter(group => group.isMember);
  const discoverGroups = groups.filter(group => !group.isMember);
  
  const filteredGroups = (groupList: CommunityGroup[]) => 
    groupList.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const categories = ['all', ...Array.from(new Set(groups.map(group => group.category)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-600"
          />
        </div>
        <Button className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="my-groups">
            <Users className="w-4 h-4 mr-2" />
            My Groups ({myGroups.length})
          </TabsTrigger>
          <TabsTrigger value="discover">
            <Search className="w-4 h-4 mr-2" />
            Discover Groups
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {myGroups.length === 0 ? (
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardContent className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-white mb-2">No Groups Yet</h3>
                <p className="text-gray-400 mb-4">Join some groups to start connecting with your community!</p>
                <Button onClick={() => setActiveTab('discover')}>
                  Discover Groups
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups(myGroups).map((group) => (
                <Card key={group.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{group.name}</span>
                            {group.isPrivate ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Globe className="w-4 h-4 text-gray-400" />
                            )}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {group.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">{group.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{group.memberCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{group.postCount}</span>
                        </span>
                      </div>
                      <span>Active {group.recentActivity}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {group.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      View Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category.replace('-', ' ')}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups(discoverGroups).map((group) => (
              <Card key={group.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{group.name}</span>
                          {group.isPrivate ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Globe className="w-4 h-4 text-gray-400" />
                          )}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {group.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">{group.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{group.memberCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{group.postCount}</span>
                      </span>
                    </div>
                    <span>Active {group.recentActivity}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleJoinGroup(group.id)}
                    className="w-full"
                    variant={group.isPrivate ? 'outline' : 'default'}
                  >
                    {group.isPrivate ? 'Request to Join' : 'Join Group'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Trending Groups</CardTitle>
              <CardDescription>
                Groups with the most activity this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Trending analytics coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityGroups;
