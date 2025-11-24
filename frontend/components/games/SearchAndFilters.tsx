import { Text } from '@/components/ui/text';
import { View, TextInput, Pressable } from 'react-native';
import { SearchIcon } from 'lucide-react-native';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showFavoritesOnly,
  onToggleFavorites,
}: SearchAndFiltersProps) {
  return (
    <View className="flex-row items-center justify-center mt-6 mb-4 px-8">
      <View className="flex-row items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl" style={{ width: '60%', maxWidth: 500 }}>
        <SearchIcon size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-2 text-white text-sm"
          placeholder="Buscar jogos"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
}

