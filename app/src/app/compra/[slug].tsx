import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchCourse, type CourseDetail } from '@/api/catalog';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/api/client';
import { createOrder } from '@/api/orders';
import { Button } from '@/components/Button';
import { CourseCover } from '@/components/CourseCover';
import { Icon } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorState } from '@/components/States';
import { colors, fonts, fontSizes, letterSpacing, radii, sizes, spacing } from '@/theme';

/** H07 · Resumen de compra: el curso y el precio en soles antes de pagar con Izipay. */
export default function ResumenCompraScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchCourse(slug);
      setCourse(data);
      setAlreadyOwned(data.is_enrolled);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [slug]);

  useEffect(() => {
    let active = true;
    fetchCourse(slug)
      .then((data) => {
        if (active) {
          setCourse(data);
          setAlreadyOwned(data.is_enrolled);
        }
      })
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, [slug]);

  const pay = async () => {
    setPaying(true);
    setNotice(null);
    try {
      const { order, paymentUrl } = await createOrder(slug);
      router.push({ pathname: '/compra/pago', params: { url: paymentUrl, orderId: String(order.id), slug } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setAlreadyOwned(true);
      }
      setNotice(error instanceof ApiError && error.status !== 0 ? error.message : NETWORK_ERROR_MESSAGE);
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="Resumen de compra" />
      {!course ? (
        <View style={styles.center}>
          {loadError ? (
            <ErrorState
              title="No pudimos cargar el curso"
              message="Revisa tu conexión e inténtalo otra vez."
              onRetry={() => {
                setLoadError(false);
                load();
              }}
            />
          ) : (
            <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando" />
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.courseCard}>
            <CourseCover uri={course.cover_url} label={course.category.name} style={styles.cover} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseMeta}>
                {course.instructor.name} · {course.level_label}
              </Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Precio del curso</Text>
              <Text style={styles.rowValue}>{course.price_label}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{course.price_label}</Text>
            </View>
          </View>

          <View style={styles.secure}>
            <Icon name="lock" color={colors.cyan} size={22} />
            <Text style={styles.secureText}>
              Pagas con tarjeta en el formulario seguro de Izipay. Coders Free no ve ni guarda los datos de tu tarjeta.
            </Text>
          </View>
          <Text style={styles.testBadge}>ENTORNO DE PRUEBAS</Text>

          {notice ? <Notice type="error" message={notice} /> : null}

          <View style={styles.actions}>
            {alreadyOwned ? (
              <Button title="Ir al curso" variant="accent" onPress={() => router.replace('/mis-cursos')} />
            ) : (
              <Button title={`Pagar ${course.price_label}`} onPress={pay} loading={paying} />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg + 2,
    padding: spacing.screen,
    paddingTop: spacing.xl,
  },
  courseCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  cover: {
    width: sizes.coverThumbWidth,
    height: sizes.coverThumbHeight,
  },
  courseInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  courseTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.paragraph,
    lineHeight: fontSizes.paragraph * 1.3,
    color: colors.snow,
  },
  courseMeta: {
    fontFamily: fonts.body,
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  totals: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
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
  totalLabel: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.paragraph,
    color: colors.snow,
  },
  totalValue: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.title - 6,
    color: colors.cyan,
  },
  secure: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceRaised,
  },
  secureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    lineHeight: fontSizes.chip * 1.5,
    color: colors.textSecondary,
  },
  testBadge: {
    alignSelf: 'flex-start',
    fontFamily: fonts.mono,
    fontSize: fontSizes.tiny + 1,
    letterSpacing: letterSpacing.tight,
    color: colors.orange,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radii.chip - 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
  },
  actions: {
    marginTop: 'auto',
  },
});
