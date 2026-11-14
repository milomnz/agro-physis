import type { RegisterOptions } from 'react-hook-form';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginForm {
  email: string;
  password: string;
}

export const LOGIN_FIELD_RULES: Record<keyof LoginForm, RegisterOptions<LoginForm>> = {
  email: {
    required: 'El email es obligatorio',
    pattern: { value: EMAIL_REGEX, message: 'El email debe ser válido' },
  },
  password: {
    required: 'La contraseña es obligatoria',
  },
};

export interface RegisterForm {
  nombre: string;
  email: string;
  password: string;
}

export const REGISTER_FIELD_RULES: Record<keyof RegisterForm, RegisterOptions<RegisterForm>> = {
  nombre: {
    required: 'El nombre es obligatorio',
    validate: (value) => {
      const trimmed = (value ?? '').trim();
      if (!trimmed) return 'El nombre es obligatorio';
      if (trimmed.length < 2 || trimmed.length > 100) {
        return 'El nombre debe tener entre 2 y 100 caracteres';
      }
      return true;
    },
  },
  email: {
    required: 'El email es obligatorio',
    pattern: { value: EMAIL_REGEX, message: 'El email debe ser válido' },
  },
  password: {
    required: 'La contraseña es obligatoria',
    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
  },
};

export interface RegisterFieldErrors {
  nombre?: string;
  email?: string;
  password?: string;
}

export function validateRegisterForm(input: {
  nombre: string;
  email: string;
  password: string;
}): RegisterFieldErrors {
  const next: RegisterFieldErrors = {};

  if (!input.nombre.trim()) {
    next.nombre = 'El nombre es obligatorio';
  } else if (input.nombre.trim().length < 2 || input.nombre.trim().length > 100) {
    next.nombre = 'El nombre debe tener entre 2 y 100 caracteres';
  }

  if (!input.email.trim()) {
    next.email = 'El email es obligatorio';
  } else if (!EMAIL_REGEX.test(input.email.trim())) {
    next.email = 'El email debe ser válido';
  }

  if (!input.password) {
    next.password = 'La contraseña es obligatoria';
  } else if (input.password.length < 6) {
    next.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return next;
}