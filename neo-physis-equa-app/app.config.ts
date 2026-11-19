/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

function resolveGoogleServicesFile(): string | undefined {
  if (process.env.GOOGLE_SERVICES_JSON) {
    return process.env.GOOGLE_SERVICES_JSON;
  }

  const localGoogleServicesPath = path.resolve(__dirname, 'google-services.json');
  if (fs.existsSync(localGoogleServicesPath)) {
    return './google-services.json';
  }

  return undefined;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig = appJson.expo as ExpoConfig;
  const googleServicesFile = resolveGoogleServicesFile();

  return {
    ...baseConfig,
    ...config,
    name: config.name ?? baseConfig.name,
    slug: config.slug ?? baseConfig.slug,
    android: {
      ...baseConfig.android,
      ...config.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
