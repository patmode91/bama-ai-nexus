
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Save, Eye, Edit3, Lock, Unlock } from 'lucide-react';

interface CollaboratorPresence {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  cursor_position?: number;
  last_seen: string;
  is_typing: boolean;
}

interface DocumentVersion {
  id: string;
  title: string;
  content: string;
  version: number;
  author_id: string;
  created_at: string;
  is_published: boolean;
}

const CollaborativeEditor = () => {
  const [document, setDocument] = useState<DocumentVersion>({
    id: 'doc1',
    title: 'Alabama Business Directory - Community Guidelines',
    content: `# Alabama Business Directory Community Guidelines

## Welcome to Our Community

Welcome to the Alabama Business Directory! We're building a vibrant ecosystem of Alabama businesses and professionals.

## Community Standards

### 1. Professional Conduct
- Maintain professional communication
- Respect diverse viewpoints and backgrounds
- Focus on constructive business discussions

### 2. Business Listings
- Provide accurate and up-to-date information
- Use appropriate categories and tags
- Include relevant contact information

### 3. Networking Etiquette
- Be genuine in your networking efforts
- Offer value before asking for help
- Follow up on commitments

## Getting Started

1. Complete your business profile
2. Join relevant industry groups
3. Participate in community discussions
4. Attend networking events

---

*This document is collaboratively maintained by our community moderators.*`,
    version: 1,
    author_id: 'current_user',
    created_at: new Date().toISOString(),
    is_published: false
  });

  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeEditor();
    return () => {
      leaveDocument();
    };
  }, []);

  const initializeEditor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to document changes
    const documentChannel = supabase
      .channel(`document_${document.id}`)
      .on('broadcast', { event: 'document_update' }, (payload) => {
        setDocument(payload.payload as DocumentVersion);
        toast({
          title: "Document updated",
          description: "Someone else updated the document",
        });
      })
      .on('broadcast', { event: 'document_lock' }, (payload) => {
        setIsLocked(payload.payload.is_locked);
        if (payload.payload.is_locked) {
          toast({
            title: "Document locked",
            description: `Document locked by ${payload.payload.locked_by}`,
            variant: "destructive"
          });
        }
      })
      .subscribe();

    // Subscribe to collaborator presence
    const presenceChannel = supabase
      .channel(`presence_${document.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const collaboratorList: CollaboratorPresence[] = [];
        
        Object.entries(state).forEach(([key, presence]) => {
          if (Array.isArray(presence) && presence.length > 0) {
            const presenceData = presence[0] as any;
            // Properly map the presence data to our interface
            collaboratorList.push({
              user_id: presenceData.user_id || key,
              user_name: presenceData.user_name || 'Anonymous',
              user_avatar: presenceData.user_avatar,
              last_seen: presenceData.last_seen || new Date().toISOString(),
              is_typing: presenceData.is_typing || false
            });
          }
        });
        
        setCollaborators(collaboratorList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe();

    // Track user presence
    await presenceChannel.track({
      user_id: user.id,
      user_name: user.user_metadata?.full_name || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url,
      last_seen: new Date().toISOString(),
      is_typing: false
    });
  };

  const leaveDocument = async () => {
    supabase.removeAllChannels();
  };

  const handleContentChange = useCallback((newContent: string) => {
    setDocument(prev => ({ ...prev, content: newContent }));
    
    // Update typing indicator
    updateTypingStatus(true);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => updateTypingStatus(false), 1000);
    setTypingTimeout(timeout);
  }, [typingTimeout]);

  const updateTypingStatus = async (isTyping: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase.channel(`presence_${document.id}`);
    await channel.track({
      user_id: user.id,
      user_name: user.user_metadata?.full_name || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url,
      last_seen: new Date().toISOString(),
      is_typing: isTyping
    });
  };

  const saveDocument = async () => {
    const channel = supabase.channel(`document_${document.id}`);
    const updatedDoc = {
      ...document,
      version: document.version + 1,
      created_at: new Date().toISOString()
    };
    
    await channel.send({
      type: 'broadcast',
      event: 'document_update',
      payload: updatedDoc
    });
    
    setDocument(updatedDoc);
    setLastSaved(new Date());
    toast({
      title: "Document saved",
      description: "Your changes have been saved successfully",
    });
  };

  const toggleLock = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase.channel(`document_${document.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'document_lock',
      payload: {
        is_locked: !isLocked,
        locked_by: user.user_metadata?.full_name || 'Anonymous'
      }
    });
  };

  const publishDocument = async () => {
    const publishedDoc = { ...document, is_published: !document.is_published };
    setDocument(publishedDoc);
    
    toast({
      title: document.is_published ? "Document unpublished" : "Document published",
      description: document.is_published 
        ? "Document is now in draft mode" 
        : "Document is now live for all users",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Collaborative Editor</span>
              </CardTitle>
              {document.is_published && (
                <Badge variant="secondary">Published</Badge>
              )}
              {isLocked && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Collaborators */}
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {collaborators.slice(0, 3).map((collaborator) => (
                    <Avatar key={collaborator.user_id} className="w-8 h-8 border-2 border-gray-900">
                      <AvatarImage src={collaborator.user_avatar} />
                      <AvatarFallback className="text-xs">
                        {collaborator.user_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {collaborators.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                      <span className="text-xs text-gray-300">+{collaborators.length - 3}</span>
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {collaborators.length}
                </Badge>
              </div>
              
              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLock}
                disabled={isLocked}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={saveDocument}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              <Button size="sm" onClick={publishDocument}>
                {document.is_published ? <Eye className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {document.is_published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Version {document.version}</span>
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
            
            {/* Typing indicators */}
            {collaborators.some(c => c.is_typing) && (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs">
                  {collaborators.filter(c => c.is_typing).map(c => c.user_name).join(', ')} typing...
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Editor */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Input
              value={document.title}
              onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
              className="text-xl font-semibold bg-gray-800 border-gray-600"
              placeholder="Document title..."
              disabled={isLocked}
            />
            
            <Textarea
              value={document.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[500px] font-mono bg-gray-800 border-gray-600"
              placeholder="Start writing..."
              disabled={isLocked}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativeEditor;
