
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Handshake, Plus, Search, Clock, DollarSign, Users, MapPin, Calendar } from 'lucide-react';

interface CollaborationOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'partnership' | 'project' | 'contract' | 'joint-venture' | 'supplier';
  budget?: string;
  timeline: string;
  location: string;
  skillsNeeded: string[];
  postedBy: {
    name: string;
    company: string;
    avatar?: string;
  };
  postedDate: string;
  applicants: number;
  status: 'open' | 'in-progress' | 'closed';
}

const mockOpportunities: CollaborationOpportunity[] = [
  {
    id: '1',
    title: 'Mobile App Development Partnership',
    description: 'Looking for a development partner to create a mobile app for local businesses. We handle marketing and business development, need technical expertise.',
    type: 'partnership',
    budget: '$15,000 - $25,000',
    timeline: '3-4 months',
    location: 'Birmingham, AL',
    skillsNeeded: ['React Native', 'Mobile Development', 'UI/UX Design'],
    postedBy: {
      name: 'Sarah Johnson',
      company: 'Marketing Pro AL',
      avatar: ''
    },
    postedDate: '2024-01-15',
    applicants: 8,
    status: 'open'
  },
  {
    id: '2',
    title: 'Website Redesign Project',
    description: 'Need a complete website redesign for our manufacturing company. Looking for a local web design agency or freelancer.',
    type: 'project',
    budget: '$5,000 - $10,000',
    timeline: '6-8 weeks',
    location: 'Huntsville, AL',
    skillsNeeded: ['Web Design', 'WordPress', 'SEO'],
    postedBy: {
      name: 'Mike Davis',
      company: 'Alabama Manufacturing Co',
      avatar: ''
    },
    postedDate: '2024-01-14',
    applicants: 12,
    status: 'open'
  },
  {
    id: '3',
    title: 'Joint Marketing Campaign',
    description: 'Several local restaurants looking to collaborate on a joint marketing campaign for Alabama food tourism.',
    type: 'joint-venture',
    timeline: '2 months',
    location: 'Mobile, AL',
    skillsNeeded: ['Marketing', 'Social Media', 'Content Creation'],
    postedBy: {
      name: 'Restaurant Alliance',
      company: 'Mobile Food & Tourism',
      avatar: ''
    },
    postedDate: '2024-01-13',
    applicants: 5,
    status: 'open'
  }
];

const CollaborationHub = () => {
  const [opportunities, setOpportunities] = useState<CollaborationOpportunity[]>(mockOpportunities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getTypeColor = (type: string) => {
    const colors = {
      partnership: 'bg-blue-500',
      project: 'bg-green-500',
      contract: 'bg-yellow-500',
      'joint-venture': 'bg-purple-500',
      supplier: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-green-500',
      'in-progress': 'bg-yellow-500',
      closed: 'bg-gray-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.skillsNeeded.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || opp.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const CreateOpportunityForm = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Post Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle>Create Collaboration Opportunity</DialogTitle>
          <DialogDescription>
            Post a new opportunity for other businesses to collaborate with you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the opportunity"
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Select opportunity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="contract">Contract Work</SelectItem>
                <SelectItem value="joint-venture">Joint Venture</SelectItem>
                <SelectItem value="supplier">Supplier Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of what you're looking for"
              className="bg-gray-800 border-gray-600"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget (Optional)</Label>
              <Input
                id="budget"
                placeholder="e.g., $5,000 - $10,000"
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                placeholder="e.g., 2-3 months"
                className="bg-gray-800 border-gray-600"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Birmingham, AL or Remote"
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <Label htmlFor="skills">Skills Needed</Label>
            <Input
              id="skills"
              placeholder="e.g., Web Development, Marketing, Design"
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
              Post Opportunity
            </Button>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-600"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="joint-venture">Joint Venture</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
            </SelectContent>
          </Select>
          <CreateOpportunityForm />
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="browse">
            <Search className="w-4 h-4 mr-2" />
            Browse Opportunities
          </TabsTrigger>
          <TabsTrigger value="my-posts">
            <Handshake className="w-4 h-4 mr-2" />
            My Posts
          </TabsTrigger>
          <TabsTrigger value="applied">
            <Clock className="w-4 h-4 mr-2" />
            Applied
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`${getTypeColor(opportunity.type)} text-white`}>
                          {opportunity.type.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${getStatusColor(opportunity.status)} text-white`}>
                          {opportunity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                    {opportunity.budget && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{opportunity.budget}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{opportunity.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{opportunity.applicants} applicants</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {opportunity.skillsNeeded.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={opportunity.postedBy.avatar} />
                        <AvatarFallback className="text-xs">
                          {opportunity.postedBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <p className="text-white">{opportunity.postedBy.name}</p>
                        <p className="text-gray-400">{opportunity.postedBy.company}</p>
                      </div>
                    </div>
                    
                    <Button size="sm">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-posts" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="text-center py-8">
              <Handshake className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No Posted Opportunities</h3>
              <p className="text-gray-400 mb-4">You haven't posted any collaboration opportunities yet.</p>
              <CreateOpportunityForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applied" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="text-center py-8">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No Applications Yet</h3>
              <p className="text-gray-400 mb-4">You haven't applied to any opportunities yet.</p>
              <Button onClick={() => window.location.hash = '#browse'}>
                Browse Opportunities
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationHub;
