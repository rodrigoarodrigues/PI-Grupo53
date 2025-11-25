import { View, Pressable } from 'react-native';
import { Menu } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { WalletHeader } from '@/components/wallet/WalletHeader';

interface MobileHeaderProps {
  title: string;
  onMenuPress: () => void;
  showWallet?: boolean;
  onDepositPress?: () => void;
}

export function MobileHeader({ 
  title, 
  onMenuPress, 
  showWallet, 
  onDepositPress 
}: MobileHeaderProps) {
  return (
    <View className="lg:hidden bg-[#0a0c10]/95 backdrop-blur-lg px-4 py-3 flex-row items-center border-b border-white/10">
      <Pressable 
        onPress={onMenuPress}
        className="mr-4"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Menu size={24} color="#fff" />
      </Pressable>
      
      <Text className="text-white text-lg font-bold flex-1">
        {title}
      </Text>

      {showWallet && onDepositPress && (
        <WalletHeader 
          onDepositPress={onDepositPress}
        />
      )}
    </View>
  );
}
