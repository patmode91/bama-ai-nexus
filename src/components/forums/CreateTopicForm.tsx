
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForums } from '@/hooks/useForums';
import { CreateTopicData } from '@/types/forums';

interface CreateTopicFormProps {
  onSuccess?: () => void;
  initialCategoryId?: string;
}

const CreateTopicForm = ({ onSuccess, initialCategoryId }: CreateTopicFormProps) => {
  const { categories, createTopic, isCreatingTopic } = useForums();
  const [formData, setFormData] = useState<CreateTopicData>({
    category_id: initialCategoryId || '',
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.title.trim() || !formData.content.trim()) {
      return;
    }

    createTopic(formData, {
      onSuccess: () => {
        setFormData({
          category_id: initialCategoryId || '',
          title: '',
          content: '',
        });
        onSuccess?.();
      },
    });
  };

  const handleChange = (field: keyof CreateTopicData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Topic</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleChange('category_id', value)}
            >
              <SelectTrigger>
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter topic title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="What would you like to discuss?"
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isCreatingTopic || !formData.category_id || !formData.title.trim() || !formData.content.trim()}
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
