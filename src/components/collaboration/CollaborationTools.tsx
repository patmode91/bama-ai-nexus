
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Users, 
  Target, 
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CollaborationProject {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }[];
  deadline: string;
  category: string;
  progress: number;
  createdAt: string;
}

const mockProjects: CollaborationProject[] = [
  {
    id: '1',
    title: 'Alabama Tech Innovation Hub',
    description: 'Creating a collaborative space for tech startups in Birmingham to share resources and expertise.',
    status: 'active',
    participants: [
      { id: '1', name: 'Sarah Johnson', role: 'Project Lead' },
      { id: '2', name: 'Michael Chen', role: 'Technical Advisor' },
      { id: '3', name: 'Emily Rodriguez', role: 'Business Analyst' }
    ],
    deadline: '2024-09-15',
    category: 'Technology',
    progress: 65,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Sustainable Agriculture Initiative',
    description: 'Developing eco-friendly farming practices and sharing knowledge across Alabama agricultural communities.',
    status: 'planning',
    participants: [
      { id: '4', name: 'David Thompson', role: 'Agriculture Expert' },
      { id: '5', name: 'Lisa Wilson', role: 'Environmental Scientist' }
    ],
    deadline: '2024-12-01',
    category: 'Agriculture',
    progress: 20,
    createdAt: '2024-02-20'
  }
];

const CollaborationTools = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    deadline: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'planning':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'on-hold':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateProject = () => {
    if (newProject.title && newProject.description) {
      // In a real app, this would create a new project via API
      console.log('Creating new project:', newProject);
      setNewProject({ title: '', description: '', category: '', deadline: '' });
      setShowCreateForm(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Collaboration Tools</h2>
          <p className="text-gray-600">
            Manage projects, coordinate with team members, and track progress on collaborative initiatives.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Create New Collaboration Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project title"
              value={newProject.title}
              onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Project description"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Category"
                value={newProject.category}
                onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
              />
              <Input
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700">
                Create Project
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Projects Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">47</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-gray-600">Due This Week</div>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {mockProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status}</span>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Category</p>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Deadline</p>
                      <p className="text-sm text-gray-600">{new Date(project.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Team Members</p>
                      <div className="flex -space-x-2 mt-1">
                        {project.participants.slice(0, 3).map((participant) => (
                          <Avatar key={participant.id} className="w-8 h-8 border-2 border-white">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.participants.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                            +{project.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discuss
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-1" />
                      Documents
                    </Button>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600 mb-4">
                Organize your collaboration teams and manage member roles and permissions.
              </p>
              <Button>Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shared Resources</h3>
              <p className="text-gray-600 mb-4">
                Access shared documents, templates, and collaboration resources.
              </p>
              <Button>Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationTools;
