import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { TextInput, Platform } from 'react-native';

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  className?: string;
}

function Input({ className, ...props }: InputProps) {
  return (
    <TextClassContext.Provider value="text-base">
      <TextInput
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground',
          'placeholder:text-muted-foreground',
          'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          Platform.select({
            web: 'web:outline-none',
          }),
          className
        )}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Input };


