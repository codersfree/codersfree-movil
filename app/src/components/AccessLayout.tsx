import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

const GRID_STEP = 24;

/** Fondo cuadriculado de la plantilla Acceso. */
function GridBackground() {
  const { width, height } = useWindowDimensions();
  const columns = Math.ceil(width / GRID_STEP);
  const rows = Math.ceil(height / GRID_STEP);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: columns }, (_, i) => (
        <View key={`c${i}`} style={[styles.vertical, { left: i * GRID_STEP }]} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <View key={`r${i}`} style={[styles.horizontal, { top: i * GRID_STEP }]} />
      ))}
    </View>
  );
}

/** Plantilla Acceso: sin pestañas, con el formulario desplazable sobre la cuadrícula. */
export function AccessLayout({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <GridBackground />
      <SafeAreaView style={styles.root}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  vertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.grid,
  },
  horizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.grid,
  },
});
