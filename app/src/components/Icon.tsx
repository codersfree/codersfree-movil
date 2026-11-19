import { Image } from 'expo-image';
import type { ColorValue } from 'react-native';

import { colors, sizes } from '@/theme';

/** Íconos de línea del lienzo de diseño (SVG en assets/icons), teñidos con el color del tema. */
const ICONS = {
  home: require('@/assets/icons/home.svg'),
  book: require('@/assets/icons/book.svg'),
  heart: require('@/assets/icons/heart.svg'),
  person: require('@/assets/icons/person.svg'),
  search: require('@/assets/icons/search.svg'),
  bell: require('@/assets/icons/bell.svg'),
  camera: require('@/assets/icons/camera.svg'),
  cameraOff: require('@/assets/icons/camera-off.svg'),
  gallery: require('@/assets/icons/gallery.svg'),
  logout: require('@/assets/icons/logout.svg'),
  back: require('@/assets/icons/back.svg'),
  forward: require('@/assets/icons/forward.svg'),
  check: require('@/assets/icons/check.svg'),
  error: require('@/assets/icons/error.svg'),
  close: require('@/assets/icons/close.svg'),
  courses: require('@/assets/icons/courses.svg'),
  sales: require('@/assets/icons/sales.svg'),
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  color?: ColorValue;
  size?: number;
};

export function Icon({ name, color = colors.snow, size = sizes.icon }: Props) {
  return (
    <Image
      source={ICONS[name]}
      tintColor={color as string}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible={false}
    />
  );
}
