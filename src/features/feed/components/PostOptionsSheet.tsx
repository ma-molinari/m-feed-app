import { Modal, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

const d = colors.dark;

type Props = {
  visible: boolean;
  isOwner: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onGoToPost: () => void;
};

export function PostOptionsSheet({
  visible,
  isOwner,
  onClose,
  onDelete,
  onEdit,
  onGoToPost,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {isOwner ? (
            <>
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  onDelete();
                  onClose();
                }}
              >
                <Text style={styles.deleteLabel}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  onEdit();
                  onClose();
                }}
              >
                <Text style={styles.rowLabel}>Edit</Text>
              </TouchableOpacity>
            </>
          ) : null}
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              onGoToPost();
              onClose();
            }}
          >
            <Text style={styles.rowLabel}>Go to post</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: d.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
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
});
