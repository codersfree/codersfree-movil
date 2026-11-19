import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { EmptyState } from './EmptyState';
import { Eyebrow, Title } from './Typography';

type Props = {
  eyebrow: string;
  title: string;
  emptyTitle: string;
  emptyMessage: string;
};

/** Pantalla con título y estado vacío, para secciones que se construyen en otro grupo. */
export function PlaceholderScreen({ eyebrow, title, emptyTitle, emptyMessage }: Props) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
      </View>
      <EmptyState title={emptyTitle} message={emptyMessage} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.xl,
  },
  heading: {
    gap: spacing.xs + 2,
  },
});
