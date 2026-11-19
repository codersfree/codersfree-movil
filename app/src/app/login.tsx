import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ApiError, NETWORK_ERROR_MESSAGE } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { AccessLayout } from '@/components/AccessLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { Eyebrow, Paragraph, Title } from '@/components/Typography';
import { colors, fonts, fontSizes, spacing } from '@/theme';

type FieldErrors = { email?: string; password?: string };

/** H02 · Inicio de sesión. Con datos incorrectos, el aviso va arriba del formulario. */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const submit = async () => {
    setSubmitting(true);
    setNotice(null);
    setFieldErrors({});
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status === 0) {
        setNotice(NETWORK_ERROR_MESSAGE);
      } else if (email.trim() && password) {
        setNotice(error.field('email') ?? error.message);
      } else {
        setFieldErrors({ email: error.field('email'), password: error.field('password') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccessLayout>
      <View style={styles.logoWrap}>
        <Image
          source={require('@/assets/images/logo-vertical.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Coders Free"
        />
      </View>
      <View style={styles.heading}>
        <Eyebrow variant="chip">Bienvenido</Eyebrow>
        <Title>Inicia sesión</Title>
        <Paragraph>Sigue tus cursos donde los dejaste.</Paragraph>
      </View>

      {notice ? <Notice type="error" message={notice} /> : null}

      <View style={styles.form}>
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
          autoComplete="password"
          error={fieldErrors.password}
          onSubmitEditing={submit}
        />
        <View style={styles.submit}>
          <Button title="Iniciar sesión" onPress={submit} loading={submitting} />
        </View>
      </View>

      <Text style={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Link href="/registro" replace style={styles.link}>
          Crea una
        </Link>
      </Text>
    </AccessLayout>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 77,
  },
  heading: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  link: {
    fontFamily: fonts.bodySemiBold,
    color: colors.cyan,
  },
});
