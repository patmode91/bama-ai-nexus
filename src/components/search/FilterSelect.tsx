
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: { value: string; label: string }[];
}

const FilterSelect = ({ label, value, onValueChange, placeholder, items }: FilterSelectProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-300">{label}</label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-gray-700 border-gray-600">
        <SelectItem value="">{placeholder}</SelectItem>
        {items.map(item => (
          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default FilterSelect;
