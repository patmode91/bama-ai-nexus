
import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForums } from '@/hooks/useForums';

interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CreateTopicFormProps {
  categories: ForumCategory[];
  onClose: () => void;
}

const CreateTopicForm = ({ categories, onClose }: CreateTopicFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { createTopic, isCreatingTopic } = useForums();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) return;
    
    createTopic({
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId
    });
    
    // Reset form
    setTitle('');
    setContent('');
    setCategoryId('');
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00C2FF]" />
            Create New Topic
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title..."
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !content.trim() || !categoryId || isCreatingTopic}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              {isCreatingTopic ? 'Creating...' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTopicForm;
