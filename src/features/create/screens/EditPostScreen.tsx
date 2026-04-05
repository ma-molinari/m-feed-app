import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import type { MainStackParamList } from '@navigation/types';
import { useEditPost } from '../hooks/useEditPost';

type EditPostRoute = RouteProp<MainStackParamList, 'EditPost'>;

export function EditPostScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { params } = useRoute<EditPostRoute>();
  const [content, setContent] = useState(params.content);

  const { mutate: savePost, isPending } = useEditPost(navigation);

  function handleSave() {
    savePost({ id: params.postId, content });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[typography.subtitle, styles.headerTitle]}>Edit Post</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerBtn, styles.saveBtn, isPending && styles.saveBtnDisabled]}
          disabled={isPending}
        >
          <Text style={[styles.headerBtnText, styles.saveBtnText]}>
            {isPending ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          autoFocus
          placeholderTextColor={colors.dark.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    color: colors.dark.text,
  },
  headerBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 64,
  },
  headerBtnText: {
    color: colors.dark.text,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: colors.dark.text,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    color: colors.dark.text,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
