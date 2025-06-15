
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ label, tags, onTagsChange, placeholder = "Add tags..." }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onTagsChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-gray-700 border-gray-600 text-white flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/30"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-[#00C2FF] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
