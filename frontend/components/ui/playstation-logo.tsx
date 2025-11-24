import { View, Text } from 'react-native';

interface PlayStationLogoProps {
  size?: number;
}

export function PlayStationLogo({ size = 20 }: PlayStationLogoProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: '#006FCD',
        borderRadius: size * 0.2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color: '#fff',
          fontSize: size * 0.5,
          fontWeight: 'bold',
        }}>
        PS
      </Text>
    </View>
  );
}


