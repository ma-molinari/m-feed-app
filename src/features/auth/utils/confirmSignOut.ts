import { Alert } from 'react-native';

/** Diálogo de confirmação antes de encerrar a sessão (único fluxo de logout na app). */
export function confirmSignOut(signOut: () => void): void {
  Alert.alert('Sair', 'Tem certeza que deseja sair?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', style: 'destructive', onPress: signOut },
  ]);
}
