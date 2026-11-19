import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RegisterData } from '@/api/auth';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { AccessLayout } from '@/components/AccessLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { Eyebrow, Paragraph, Title } from '@/components/Typography';
import { colors, fonts, fontSizes, spacing } from '@/theme';

type Field = keyof RegisterData;

const EMPTY_FORM: RegisterData = { name: '', email: '', password: '', password_confirmation: '' };

/** H01 · Registro. Los errores de la API van debajo de cada campo. */
export default function RegistroScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState<RegisterData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: Field) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    setSubmitting(true);
    setErrors({});
    setNotice(null);
    try {
      await signUp({ ...form, name: form.name.trim(), email: form.email.trim() });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors({
          name: error.field('name'),
          email: error.field('email'),
          password: error.field('password'),
          password_confirmation: error.field('password_confirmation'),
        });
      } else {
        setNotice(error instanceof ApiError && error.status !== 0 ? error.message : NETWORK_ERROR_MESSAGE);
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
        <Eyebrow variant="chip">Nueva cuenta</Eyebrow>
        <Title>Crea tu cuenta</Title>
        <Paragraph>Compra cursos y llévalos desde tu celular.</Paragraph>
      </View>

      {notice ? <Notice type="error" message={notice} /> : null}

      <View style={styles.form}>
        <TextField
          label="Nombre"
          value={form.name}
          onChangeText={setField('name')}
          placeholder="Tu nombre completo"
          autoComplete="name"
          error={errors.name}
        />
        <TextField
          label="Correo"
          value={form.email}
          onChangeText={setField('email')}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Contraseña"
          value={form.password}
          onChangeText={setField('password')}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
        />
        <TextField
          label="Confirma tu contraseña"
          value={form.password_confirmation}
          onChangeText={setField('password_confirmation')}
          placeholder="Repite la contraseña"
          secureTextEntry
          autoComplete="new-password"
          error={errors.password_confirmation}
          onSubmitEditing={submit}
        />
        <View style={styles.submit}>
          <Button title="Crear cuenta" onPress={submit} loading={submitting} />
        </View>
      </View>

      <Text style={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" replace style={styles.link}>
          Inicia sesión
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
    width: 110,
    height: 57,
  },
  heading: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md + 2,
  },
  submit: {
    marginTop: spacing.xs + 2,
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
