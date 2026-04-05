import { Image, type ImageProps } from 'expo-image';
import { type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageProps['contentFit'];
};

/** Imagens remotas com cache; no Expo usamos `expo-image` (substitui react-native-fast-image com React 19). */
export function RemoteImage({ uri, style, contentFit = 'cover' }: Props) {
  return <Image source={{ uri }} style={style} contentFit={contentFit} transition={120} />;
}
