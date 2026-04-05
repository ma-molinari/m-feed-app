import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import type { MainStackParamList } from '@navigation/types';
import { useCreatePost } from '../hooks/useCreatePost';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type SelectedImage = {
  uri: string;
  fileSize?: number;
};

export function CreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [content, setContent] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const { mutate: submitPost, isPending } = useCreatePost(navigation);

  const hasChanges = image !== null || content.trim().length > 0;

  async function pickImage() {
    setImageError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize !== undefined && asset.fileSize > MAX_FILE_SIZE) {
        setImageError('Image must be smaller than 5MB.');
        return;
      }
      setImage({ uri: asset.uri, fileSize: asset.fileSize });
    }
  }

  function handleCancel() {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }
    Alert.alert('Discard post?', 'Your changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }

  function handleSubmit() {
    if (!image) {
      setImageError('Please select an image.');
      return;
    }
    submitPost({ uri: image.uri, content });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[typography.subtitle, styles.headerTitle]}>New Post</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.headerBtn, styles.submitBtn, (!image || isPending) && styles.submitBtnDisabled]}
          disabled={!image || isPending}
        >
          <Text style={[styles.headerBtnText, styles.submitBtnText]}>
            {isPending ? 'Posting…' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={[styles.imagePicker, image && styles.imagePickerFilled]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>＋</Text>
              <Text style={styles.imagePlaceholderText}>Tap to select a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}

        <TextInput
          style={styles.textInput}
          placeholder="Write a caption… (optional)"
          placeholderTextColor={colors.dark.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
        />
      </ScrollView>
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
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: colors.dark.text,
    fontWeight: '600',
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePickerFilled: {
    borderStyle: 'solid',
    borderWidth: 0,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  imagePlaceholderIcon: {
    fontSize: 40,
    color: colors.dark.textMuted,
  },
  imagePlaceholderText: {
    color: colors.dark.textMuted,
    fontSize: 15,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: -spacing.sm,
  },
  textInput: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    color: colors.dark.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
