import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, sizes } from '@/theme';

/** Iniciales de un nombre: "María Ríos" → "MR". */
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

type Props = {
  name: string;
  uri?: string | null;
  size?: number;
};

/** Foto de perfil; sin foto muestra las iniciales. */
export function Avatar({ name, uri, size = sizes.avatar }: Props) {
  const shape = { width: size, height: size, borderRadius: radii.round };

  return (
    <View style={[styles.circle, shape]}>
      {uri ? (
        <Image source={{ uri }} style={shape} contentFit="cover" transition={150} accessibilityLabel={`Foto de ${name}`} />
      ) : (
        <Text style={[styles.initials, { fontSize: size === sizes.avatar ? fontSizes.avatar : size * 0.36 }]}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: fonts.heading,
    color: colors.cyan,
  },
});
