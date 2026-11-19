import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { fetchOrder } from '@/api/orders';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorState } from '@/components/States';
import { colors, spacing } from '@/theme';

type PaymentMessage = {
  type: 'payment-result';
  status: 'paid' | 'rejected' | 'error';
  message: string;
  orderId: number;
};

/**
 * H07 · Formulario de pago de Izipay dentro de la app (WebView).
 * La página la sirve la API; al terminar, la API ya validó el hash y la página avisa el resultado.
 */
export default function PagoScreen() {
  const { url, orderId, slug } = useLocalSearchParams<{ url: string; orderId: string; slug: string }>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [webKey, setWebKey] = useState(0);
  const handled = useRef(false);

  const showResult = (status: PaymentMessage['status'], message: string) => {
    router.replace({ pathname: '/compra/resultado', params: { status, message, orderId, slug } });
  };

  const onMessage = async (event: WebViewMessageEvent) => {
    let result: PaymentMessage;
    try {
      result = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (result.type !== 'payment-result' || handled.current) {
      return;
    }
    handled.current = true;

    if (result.status !== 'paid') {
      showResult(result.status, result.message);
      return;
    }

    // Se confirma con la API: solo cuenta como comprado si el pedido quedó pagado.
    try {
      const order = await fetchOrder(Number(orderId));
      showResult(order.status === 'paid' ? 'paid' : 'error', order.status === 'paid' ? result.message : 'No pudimos confirmar el pago.');
    } catch {
      showResult('error', 'No pudimos confirmar el pago. Revisa Mis cursos en unos minutos.');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="Pago con tarjeta" subtitle="Formulario seguro de Izipay · entorno de pruebas" icon="close" />
      {Platform.OS === 'web' ? (
        <View style={styles.center}>
          <EmptyState title="Paga desde el celular" message="El formulario de Izipay se abre dentro de la app de Android." />
        </View>
      ) : loadFailed ? (
        <View style={styles.center}>
          <ErrorState
            title="No pudimos abrir el pago"
            message="Revisa tu conexión e inténtalo otra vez."
            onRetry={() => {
              setLoadFailed(false);
              setLoading(true);
              setWebKey((key) => key + 1);
            }}
          />
        </View>
      ) : (
        <View style={styles.webWrap}>
          <WebView
            key={webKey}
            source={{ uri: url }}
            onMessage={onMessage}
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoadFailed(true)}
            onHttpError={() => setLoadFailed(true)}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            style={styles.web}
          />
          {loading ? (
            <View style={styles.loading} pointerEvents="none">
              <ActivityIndicator color={colors.cyan} size="large" accessibilityLabel="Cargando el formulario de pago" />
            </View>
          ) : null}
        </View>
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
  webWrap: {
    flex: 1,
  },
  web: {
    flex: 1,
    backgroundColor: colors.night,
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.night,
  },
});
