# Configuración de Firebase Cloud Messaging (FCM v1) para Android

Esta guía documenta los pasos exactos para habilitar notificaciones push remotas en Android mediante Firebase Cloud Messaging (FCM v1) con Expo / EAS para **agrophysis**.

## Datos del proyecto

- **Package de Android:** `com.juancarvajalsteam.agrophysis`
- **EAS Project ID:** `b706fad7-189b-47dc-9a03-37b5b744c070`
- **Owner de Expo:** `juancarvajals-team`

> **Nota:** Mientras no exista `google-services.json`, la aplicación compila y funciona normalmente (los recordatorios locales de revisión de cultivo funcionan sin Firebase ni conexión, y el registro de token push remoto degrada de forma segura sin bloquear la autenticación).

---

## Paso 1: Crear/abrir proyecto en Firebase y registrar la app Android

1. Ingresa a [Firebase Console](https://console.firebase.google.com/) y selecciona o crea tu proyecto.
2. Haz clic en **Agregar app** -> **Android**.
3. En **Nombre del paquete de Android**, ingresa exactamente:
   ```text
   com.juancarvajalsteam.agrophysis
   ```
4. Completa el registro y descarga el archivo **`google-services.json`**.
5. Coloca el archivo en la raíz de la app móvil:
   ```text
   neo-physis-equa-app/google-services.json
   ```
   - `google-services.json` ya está incluido en `.gitignore` para evitar subir credenciales al repositorio.
   - `app.config.ts` detecta automáticamente `./google-services.json` (o la variable de entorno `GOOGLE_SERVICES_JSON` en EAS Build) y configura `android.googleServicesFile`.

---

## Paso 2: Generar la llave de Service Account para FCM v1

Expo Push Service utiliza la API HTTP v1 de Firebase Cloud Messaging y requiere una cuenta de servicio de Google Cloud:

1. En Firebase Console, ve a **Configuración del proyecto** (ícono de engranaje) -> pestaña **Cuentas de servicio**.
2. En la sección **SDK de Firebase Admin**, haz clic en **Generar nueva clave privada** y confirma.
3. Guarda el archivo JSON descargado en un lugar seguro fuera del repositorio (por ejemplo, `fcm-service-account.json`). **Nunca lo subas a Git.**

---

## Paso 3: Subir las credenciales FCM v1 a EAS

Desde el directorio `neo-physis-equa-app/`, ejecuta:

```bash
eas credentials
```

1. Selecciona la plataforma **Android**.
2. Selecciona el perfil (por ejemplo, `preview` o `production`).
3. Elige **Google Service Account** -> **Manage your Google Service Account Key for Push Notifications (FCM V1)** -> **Upload a new service account key**.
4. Proporciona la ruta al archivo JSON de la cuenta de servicio generado en el Paso 2.

*(Opcional para builds en la nube de EAS sin commitear `google-services.json`)*:
Puedes subir `google-services.json` como variable de entorno tipo archivo en EAS:

```bash
eas env:create --name GOOGLE_SERVICES_JSON --value ./google-services.json --type file --visibility secret --environment preview
```

`app.config.ts` prioriza `process.env.GOOGLE_SERVICES_JSON` cuando está definido.

---

## Paso 4: Compilar el binario Android con EAS Build

Las notificaciones push remotas requieren un build nativo (no funcionan en Expo Go en Android):

```bash
cd neo-physis-equa-app
eas build --platform android --profile preview
```

1. Instala el APK generado en un dispositivo físico Android.
2. Inicia sesión en la app y concede el permiso de notificaciones.
3. La app obtendrá automáticamente el `ExponentPushToken[...]` para el proyecto `b706fad7-189b-47dc-9a03-37b5b744c070` y lo enviará a `PUT /api/auth/push-token`.
4. Para probar el envío remoto, registra una plaga con severidad `media` o `alta`, o llama al endpoint autenticado `POST /api/notifications/test`.
