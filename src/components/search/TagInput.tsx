
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  label: string;
}

const TagInput = ({ tags, onTagsChange, label }: TagInputProps) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2 lg:col-span-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <Input
        placeholder="Type a tag and press Enter"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleAddTag}
        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      />
      <div className="flex flex-wrap gap-1 pt-1 min-h-[24px]">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="bg-gray-600 text-white">
            {tag}
            <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-gray-400 hover:text-white text-xs font-bold">x</button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
