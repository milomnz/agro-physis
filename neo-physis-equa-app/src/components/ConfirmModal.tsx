import { Modal, Text, View } from 'react-native';

import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';
import Button from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  loading = false,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { palette } = useAccessibility();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!loading) onCancel();
      }}
    >
      <View className="flex-1 items-center justify-center bg-tinta/80 p-6">
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          className={`w-full max-w-md gap-4 rounded-tarjeta p-6 ${palette.card}`}
        >
          <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
            {title}
          </Text>
          <Text className={`${type.body} ${palette.body}`}>{message}</Text>

          <View className="mt-2 gap-3">
            <Button
              text={loading ? 'Eliminando…' : confirmText}
              onPress={onConfirm}
              danger={danger}
              icon={danger ? 'trash-outline' : undefined}
              disabled={loading}
            />
            <Button text={cancelText} onPress={onCancel} secondary disabled={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
