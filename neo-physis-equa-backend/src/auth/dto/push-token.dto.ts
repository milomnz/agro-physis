import { IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export const EXPO_PUSH_TOKEN_REGEX = /^Expo(nent)?PushToken\[.+\]$/;

export class PushTokenDto {
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'El token push debe ser una cadena de texto o null' })
  @MaxLength(255, {
    message: 'El token push no puede superar los 255 caracteres',
  })
  @Matches(EXPO_PUSH_TOKEN_REGEX, {
    message: 'El token push debe tener un formato válido de Expo',
  })
  token: string | null;
}
