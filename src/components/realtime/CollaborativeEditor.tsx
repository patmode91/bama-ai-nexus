
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/hooks/useRealtime';
import { 
  Save, 
  Users, 
  Edit3, 
  Clock,
  Download,
  Share2
} from 'lucide-react';

interface EditorUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

interface DocumentVersion {
  id: string;
  content: string;
  timestamp: number;
  author: string;
  changes: string;
}

const CollaborativeEditor = () => {
  const [content, setContent] = useState('# Collaborative Document\n\nStart typing to collaborate in real-time...\n\n## Meeting Notes\n- \n- \n- \n\n## Action Items\n- [ ] \n- [ ] \n- [ ] ');
  const [title, setTitle] = useState('Untitled Document');
  const [activeUsers, setActiveUsers] = useState<EditorUser[]>([
    { id: '1', name: 'You', avatar: undefined },
    { id: '2', name: 'Sarah Johnson', cursor: { line: 3, column: 15 } },
    { id: '3', name: 'Mike Davis', cursor: { line: 7, column: 8 } }
  ]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const { broadcast } = useRealtime({
    channel: 'collaborative-editor',
    eventTypes: ['content_change', 'cursor_move', 'user_join'],
    onEvent: (event) => {
      switch (event.type) {
        case 'content_change':
          setContent(event.data.content);
          break;
        case 'cursor_move':
          setActiveUsers(prev => prev.map(user => 
            user.id === event.data.userId 
              ? { ...user, cursor: event.data.cursor }
              : user
          ));
          break;
        case 'user_join':
          setActiveUsers(prev => [...prev, event.data.user]);
          break;
      }
    }
  });

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Broadcast changes to other users
    broadcast({
      type: 'content_change',
      data: { content: newContent, userId: 'current-user' }
    });
  };

  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    
    // Simulate save delay
    setTimeout(() => {
      setLastSaved(new Date());
      setIsAutoSaving(false);
      
      // Add to version history
      const newVersion: DocumentVersion = {
        id: Date.now().toString(),
        content,
        timestamp: Date.now(),
        author: 'You',
        changes: 'Auto-saved changes'
      };
      
      setVersions(prev => [newVersion, ...prev.slice(0, 9)]); // Keep last 10 versions
    }, 1000);
  };

  const handleManualSave = () => {
    handleAutoSave();
  };

  const exportDocument = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-5 h-5" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {isAutoSaving && (
                <Badge variant="outline" className="text-xs">
                  Saving...
                </Badge>
              )}
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 5).map((user) => (
                  <Avatar key={user.id} className="w-6 h-6 border-2 border-white">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{activeUsers.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportDocument}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleManualSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Editor */}
            <div className="lg:col-span-3">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[500px] font-mono text-sm bg-gray-800 border-gray-600 resize-none"
                placeholder="Start typing your document..."
              />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Active Users */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                      {user.cursor && (
                        <Badge variant="outline" className="text-xs">
                          L{user.cursor.line}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Version History */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Version History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                  {versions.map((version) => (
                    <div key={version.id} className="p-2 bg-gray-700 rounded text-xs">
                      <div className="font-medium">{version.author}</div>
                      <div className="text-gray-400">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                      <div className="text-gray-300">{version.changes}</div>
                    </div>
                  ))}
                  
                  {versions.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No versions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativeEditor;
