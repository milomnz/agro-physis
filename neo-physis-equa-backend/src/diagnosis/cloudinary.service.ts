import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
const CLOUDINARY_FOLDER = 'agro-physis/leaves';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  async uploadLeafImage(
    imageBase64: string,
    mimeType = 'image/jpeg',
  ): Promise<string | null> {
    const cloudName = this.configService
      .get<string>('CLOUDINARY_CLOUD_NAME')
      ?.trim();
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = this.configService
      .get<string>('CLOUDINARY_API_SECRET')
      ?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Credenciales de Cloudinary no configuradas; se omitirá la subida remota de la imagen.',
      );
      return null;
    }

    const safeMime = ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
      ? mimeType.toLowerCase()
      : 'image/jpeg';

    const cleanBase64 = imageBase64
      .replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
      .trim();
    if (!cleanBase64) {
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signaturePayload = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(signaturePayload).digest('hex');

    const formData = new URLSearchParams();
    formData.append('file', `data:${safeMime};base64,${cleanBase64}`);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('folder', CLOUDINARY_FOLDER);
    formData.append('signature', signature);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        },
      );

      const data = (await response.json()) as CloudinaryUploadResponse;
      if (!response.ok || !data.secure_url) {
        this.logger.warn(
          `Cloudinary rechazó la subida (${response.status}): ${
            data.error?.message ?? 'Error desconocido'
          }`,
        );
        return null;
      }

      return data.secure_url;
    } catch (error) {
      this.logger.warn(
        `Error de red al subir imagen a Cloudinary: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
