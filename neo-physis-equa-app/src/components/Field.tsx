import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

import TextField, { type TextFieldProps } from './TextField';

interface FieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'error'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: RegisterOptions<T>;
}

/** TextField conectado a react-hook-form. */
export default function Field<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  ...inputProps
}: FieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextField
          label={label}
          error={error?.message}
          value={value ?? ''}
          {...inputProps}
          onChangeText={onChange}
          onBlur={onBlur}
        />
      )}
    />
  );
}
