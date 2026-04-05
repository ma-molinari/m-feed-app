import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';
import { radii } from '@theme/radii';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

const d = colors.dark;

type Phase = 'menu' | 'deleteConfirm';

type Props = {
  visible: boolean;
  isOwner: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onGoToPost: () => void;
  deletePending?: boolean;
  deleteError?: string | null;
};

export function PostOptionsSheet({
  visible,
  isOwner,
  onClose,
  onDelete,
  onEdit,
  onGoToPost,
  deletePending = false,
  deleteError = null,
}: Props) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('menu');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        setPhase('menu');
      }}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, sheetShadow, { paddingBottom: spacing.lg + insets.bottom }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleWrap} importantForAccessibility="no">
            <View style={styles.handle} importantForAccessibility="no" />
          </View>

          {phase === 'deleteConfirm' ? (
            <>
              <View style={styles.confirmHeader}>
                <Text style={styles.confirmTitle}>Excluir publicação?</Text>
                <Text style={styles.confirmSub}>Esta ação não pode ser desfeita.</Text>
              </View>
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  setPhase('menu');
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancelar exclusão"
              >
                <Text style={styles.rowLabel}>Cancelar</Text>
              </TouchableOpacity>
              {deleteError ? (
                <Text style={styles.deleteErrorText} accessibilityLiveRegion="polite">
                  {deleteError}
                </Text>
              ) : null}
              <TouchableOpacity
                style={[styles.row, styles.rowLast, deletePending && styles.rowDisabled]}
                onPress={() => {
                  if (deletePending) return;
                  onDelete();
                }}
                disabled={deletePending}
                accessibilityRole="button"
                accessibilityLabel="Confirmar exclusão da publicação"
                accessibilityState={{ busy: deletePending }}
              >
                {deletePending ? (
                  <ActivityIndicator color={colors.error} />
                ) : (
                  <Text style={styles.deleteLabel}>Excluir</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isOwner ? (
                <>
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => {
                      setPhase('deleteConfirm');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Excluir publicação"
                  >
                    <Text style={styles.deleteLabel}>Excluir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => {
                      onEdit();
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Editar publicação"
                  >
                    <Text style={styles.rowLabel}>Editar</Text>
                  </TouchableOpacity>
                </>
              ) : null}
              <TouchableOpacity
                style={[styles.row, styles.rowLast]}
                onPress={() => {
                  onGoToPost();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Ir para a publicação"
              >
                <Text style={styles.rowLabel}>Ir para a publicação</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sheetShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  android: { elevation: 24 },
  default: {},
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: d.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: radii.sheetTop,
    borderTopRightRadius: radii.sheetTop,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: d.sheetBorderTop,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: radii.sheetHandle,
    backgroundColor: d.sheetHandle,
  },
  confirmHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
  },
  confirmTitle: {
    ...typography.subtitle,
    color: d.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmSub: {
    ...typography.caption,
    color: d.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  row: {
    minHeight: 52,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    ...typography.body,
    color: d.text,
    textAlign: 'center',
  },
  deleteLabel: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteErrorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  rowDisabled: {
    opacity: 0.6,
  },
});
