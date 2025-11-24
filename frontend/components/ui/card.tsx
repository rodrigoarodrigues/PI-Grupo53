import { TextClassContext } from '@/components/ui/text';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

function Card({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-sm shadow-black/5',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  );
}

function CardTitle({ className, children, ...props }: React.ComponentProps<typeof View> & { children?: React.ReactNode }) {
  return (
    <TextClassContext.Provider value="text-2xl font-semibold leading-none tracking-tight">
      <View className={className} {...props}>
        {typeof children === 'string' ? (
          <Text>{children}</Text>
        ) : (
          children
        )}
      </View>
    </TextClassContext.Provider>
  );
}

function CardDescription({ className, children, ...props }: React.ComponentProps<typeof View> & { children?: React.ReactNode }) {
  return (
    <TextClassContext.Provider value="text-sm text-muted-foreground">
      {typeof children === 'string' ? (
        <Text className={className}>{children}</Text>
      ) : (
        <View className={className} {...props}>{children}</View>
      )}
    </TextClassContext.Provider>
  );
}

function CardContent({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={cn('flex items-center p-6 pt-0', className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

