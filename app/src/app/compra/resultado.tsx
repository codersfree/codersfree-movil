import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchOrder, type Order } from '@/api/orders';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { colors, fonts, fontSizes, radii, sizes, spacing } from '@/theme';

/** H07 · Resultado del pago: aprobado (Ir al curso) o rechazado (motivo e Intentar de nuevo). */
export default function ResultadoScreen() {
  const { status, message, orderId, slug } = useLocalSearchParams<{
    status: 'paid' | 'rejected' | 'error';
    message: string;
    orderId: string;
    slug: string;
  }>();
  const [order, setOrder] = useState<Order | null>(null);
  const paid = status === 'paid';

  useEffect(() => {
    fetchOrder(Number(orderId)).then(setOrder).catch(() => setOrder(null));
  }, [orderId]);

  const tryAgain = () => router.replace({ pathname: '/compra/[slug]', params: { slug } });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.badge, { borderColor: paid ? colors.green : colors.red }]}>
          <Icon name={paid ? 'check' : 'close'} color={paid ? colors.green : colors.red} size={46} />
        </View>

        <View style={styles.texts} accessibilityRole={paid ? 'summary' : 'alert'}>
          <Text style={styles.title}>{paid ? '¡CURSO COMPRADO!' : 'EL PAGO NO SE COMPLETÓ'}</Text>
          <Text style={styles.subtitle}>
            {paid
              ? `Ya puedes empezar ${order?.course.title ?? 'tu curso'}. Lo encuentras en Mis cursos.`
              : 'No se hizo ningún cobro y el curso no se agregó a tu cuenta.'}
          </Text>
        </View>

        {paid ? (
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Total pagado</Text>
              <Text style={[styles.rowValue, styles.amount]}>{order?.amount_label ?? '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>N.º de pedido</Text>
              <Text style={styles.rowValue}>{order ? order.reference.slice(0, 8).toUpperCase() : '—'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.reason}>
            <Icon name="error" color={colors.red} size={22} />
            <View style={styles.reasonTexts}>
              <Text style={styles.reasonLabel}>Motivo que indica Izipay</Text>
              <Text style={styles.reasonText}>{message || 'El banco rechazó el pago.'}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {paid ? (
            <>
              <Button title="Ir al curso" onPress={() => router.replace({ pathname: '/aprender/[slug]', params: { slug } })} />
              <Button title="Seguir explorando" variant="outline" onPress={() => router.replace('/')} />
            </>
          ) : (
            <>
              <Button title="Intentar de nuevo" onPress={tryAgain} />
              <Button
                title="Volver al curso"
                variant="outline"
                onPress={() => router.replace({ pathname: '/curso/[slug]', params: { slug } })}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xl - 4,
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  badge: {
    width: sizes.avatar - spacing.xl,
    height: sizes.avatar - spacing.xl,
    borderRadius: radii.round,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.title - 2,
    color: colors.snow,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.paragraph,
    lineHeight: fontSizes.paragraph * 1.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  rowValue: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  amount: {
    color: colors.cyan,
  },
  reason: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceRaised,
  },
  reasonTexts: {
    flex: 1,
    gap: spacing.xs,
  },
  reasonLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  reasonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.body,
    color: colors.snow,
  },
  actions: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
