import { Alert, Platform } from 'react-native';

export class AlertService {
  static success(title: string, message?: string, onPress?: () => void) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}\n${message || ''}`);
      onPress?.();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress }]);
    }
  }

  static error(title: string, message?: string, onPress?: () => void) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`❌ ${title}\n${message || ''}`);
      onPress?.();
    } else {
      Alert.alert(`❌ ${title}`, message, [{ text: 'OK', onPress }]);
    }
  }

  static warning(title: string, message?: string, onPress?: () => void) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`⚠️ ${title}\n${message || ''}`);
      onPress?.();
    } else {
      Alert.alert(`⚠️ ${title}`, message, [{ text: 'OK', onPress }]);
    }
  }

  static confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(`${title}\n${message}`);
      if (confirmed) {
        onConfirm();
      } else {
        onCancel?.();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancelar', style: 'cancel', onPress: onCancel },
          { text: 'Confirmar', onPress: onConfirm, style: 'default' },
        ]
      );
    }
  }

  static info(title: string, message?: string, onPress?: () => void) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`ℹ️ ${title}\n${message || ''}`);
      onPress?.();
    } else {
      Alert.alert(`ℹ️ ${title}`, message, [{ text: 'OK', onPress }]);
    }
  }
}

