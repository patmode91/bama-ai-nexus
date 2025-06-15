
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Video, 
  Share2,
  Edit3,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  role: 'owner' | 'editor' | 'viewer';
}

interface Project {
  id: string;
  name: string;
  type: 'document' | 'presentation' | 'spreadsheet';
  lastModified: Date;
  collaborators: Collaborator[];
}

const CollaborativeWorkspace = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  const collaborators: Collaborator[] = [
    { id: '1', name: 'Sarah Johnson', status: 'online', role: 'owner' },
    { id: '2', name: 'Mike Davis', status: 'online', role: 'editor' },
    { id: '3', name: 'Lisa Wilson', status: 'away', role: 'viewer' },
    { id: '4', name: 'Tom Brown', status: 'offline', role: 'editor' }
  ];

  const projects: Project[] = [
    {
      id: '1',
      name: 'Business Partnership Proposal',
      type: 'document',
      lastModified: new Date(Date.now() - 300000),
      collaborators: collaborators.slice(0, 3)
    },
    {
      id: '2',
      name: 'Q4 Marketing Strategy',
      type: 'presentation',
      lastModified: new Date(Date.now() - 600000),
      collaborators: collaborators.slice(1, 4)
    },
    {
      id: '3',
      name: 'Revenue Projections',
      type: 'spreadsheet',
      lastModified: new Date(Date.now() - 900000),
      collaborators: [collaborators[0], collaborators[2]]
    }
  ];

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectIcon = (type: Project['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'presentation':
        return <Share2 className="w-5 h-5" />;
      case 'spreadsheet':
        return <Edit3 className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Collaborative Workspace</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="collaborators">Team</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="New project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <Button>Create Project</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getProjectIcon(project.type)}
                          <span className="font-medium">{project.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.collaborators.slice(0, 3).map((collaborator) => (
                            <div key={collaborator.id} className="relative">
                              <Avatar className="w-6 h-6 border-2 border-white">
                                <AvatarImage src={collaborator.avatar} />
                                <AvatarFallback className="text-xs">
                                  {collaborator.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                            </div>
                          ))}
                          {project.collaborators.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{project.collaborators.length - 3}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{project.lastModified.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="collaborators" className="space-y-4">
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                      </div>
                      <div>
                        <div className="font-medium">{collaborator.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{collaborator.status}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(collaborator.role)}>
                        {collaborator.role}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-3">
                {[
                  { user: 'Sarah Johnson', action: 'edited Business Partnership Proposal', time: '2 minutes ago' },
                  { user: 'Mike Davis', action: 'commented on Q4 Marketing Strategy', time: '5 minutes ago' },
                  { user: 'Lisa Wilson', action: 'shared Revenue Projections', time: '12 minutes ago' },
                  { user: 'Tom Brown', action: 'joined the workspace', time: '1 hour ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <div className="flex-1">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativeWorkspace;
