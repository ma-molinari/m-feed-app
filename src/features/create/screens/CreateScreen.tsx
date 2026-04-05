import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import type { MainStackParamList } from '@navigation/types';
import { useCreatePost } from '../hooks/useCreatePost';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_CAPTION = 500;

type SelectedImage = {
  uri: string;
  fileSize?: number;
};

type PickerSource = 'library' | 'camera';

export function CreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [content, setContent] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const { mutate: submitPost, isPending } = useCreatePost(navigation);

  const hasChanges = image !== null || content.trim().length > 0;
  const captionLen = content.length;

  function assignPickedAsset(asset: ImagePicker.ImagePickerAsset) {
    if (asset.fileSize !== undefined && asset.fileSize > MAX_FILE_SIZE) {
      setImageError('A imagem tem de ter menos de 5 MB.');
      return;
    }
    setImage({ uri: asset.uri, fileSize: asset.fileSize });
  }

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setImageError('Precisamos de permissão para aceder à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      assignPickedAsset(result.assets[0]);
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setImageError('Precisamos de permissão para usar a câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      assignPickedAsset(result.assets[0]);
    }
  }

  async function runPick(source: PickerSource) {
    setImageError(null);
    if (source === 'library') {
      await pickFromLibrary();
    } else {
      await pickFromCamera();
    }
  }

  function openMediaPicker() {
    Alert.alert('Adicionar foto', 'Escolha uma origem', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Galeria', onPress: () => void runPick('library') },
      { text: 'Câmera', onPress: () => void runPick('camera') },
    ]);
  }

  function handleCancel() {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }
    Alert.alert('Descartar publicação?', 'As alterações serão perdidas.', [
      { text: 'Continuar a editar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }

  function handleSubmit() {
    if (!image) {
      setImageError('Selecione uma foto para publicar.');
      return;
    }
    submitPost({ uri: image.uri, content });
  }

  const postVisuallyDisabled = !image || isPending;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: spacing.sm }]}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
        >
          <Text style={styles.headerBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={[typography.subtitle, styles.headerTitle]}>Novo post</Text>
        <Pressable
          onPress={() => {
            if (isPending) {
              return;
            }
            handleSubmit();
          }}
          style={({ pressed }) => [
            styles.headerBtn,
            styles.submitBtn,
            postVisuallyDisabled ? styles.submitBtnDisabled : null,
            pressed && !postVisuallyDisabled ? styles.submitBtnPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isPending ? 'A publicar' : 'Publicar'}
          accessibilityHint={
            !image && !isPending ? 'Selecione uma foto antes de publicar' : undefined
          }
          accessibilityState={{ disabled: isPending }}
        >
          <Text
            style={[
              styles.headerBtnText,
              styles.submitBtnText,
              !image && !isPending ? styles.submitBtnTextDisabled : null,
            ]}
          >
            {isPending ? 'A publicar…' : 'Publicar'}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.body,
            { paddingBottom: spacing.lg + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.imagePicker, image && styles.imagePickerFilled]}
            onPress={openMediaPicker}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={image ? 'Alterar foto' : 'Selecionar foto'}
            accessibilityHint="Abre opções de galeria ou câmera"
          >
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={colors.dark.searchBarIcon} />
                <Text style={styles.imagePlaceholderText}>Toque para escolher uma foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}

          <TextInput
            style={styles.textInput}
            placeholder="Escreva uma legenda… (opcional)"
            placeholderTextColor={colors.dark.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CAPTION}
            accessibilityLabel="Legenda do post"
          />
          <Text style={styles.charCounter} accessibilityLiveRegion="polite">
            {captionLen} / {MAX_CAPTION}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    color: colors.dark.text,
  },
  headerBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnText: {
    color: colors.dark.text,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
  },
  submitBtnDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  submitBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  submitBtnText: {
    color: colors.dark.text,
    fontWeight: '600',
  },
  submitBtnTextDisabled: {
    color: colors.dark.textMuted,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
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
  charCounter: {
    alignSelf: 'flex-end',
    color: colors.dark.captionCounter,
    ...typography.caption,
    marginTop: -spacing.sm,
  },
});
