import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { View, Pressable, Modal } from 'react-native';
import { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function Select({ options, value, onValueChange, placeholder = 'Selecione...', className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={cn('relative', className)}>
      <Pressable onPress={() => setIsOpen(true)}>
        <View className="flex h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2">
          <Text className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Text className="text-muted-foreground">▼</Text>
        </View>
      </Pressable>
      
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable 
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={() => setIsOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="w-64 rounded-md border border-border bg-card shadow-lg">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={cn(
                    'px-4 py-3 border-b border-border last:border-b-0',
                    value === option.value && 'bg-accent'
                  )}>
                  <Text className={value === option.value ? 'font-semibold' : ''}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export { Select };

