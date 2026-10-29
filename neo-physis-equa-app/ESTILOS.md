# Estilos estándar · Neo Physis Equa móvil

Cadenas de NativeWind que ya usa la app. **Copia de aquí, no inventes una
variante nueva.** Si algo se repite tres veces, se vuelve componente en
`src/components/`.

Regla base: primero busca el componente (`Button`, `Field`, `Select`,
`SearchBar`, `ChipFilter`, `Badge`, `Notice`). Solo si no existe, usa las clases
sueltas de este documento.

Fuente de verdad visual: `dist_styles.md` (diccionario histórico) y el
**Documento de visión** (`neo-physis-equa/Respaldo/`): "biofilia funcional".

Regla de accesibilidad del manual: **nunca solo color**. Estado = color +
ícono + texto.

---

## Paleta (Light)

Tokens definidos en `tailwind.config.js` y en `src/theme/tokens.ts` (para props
nativas como `placeholderTextColor`, `color`, `trackColor`).

| Papel | Token | Hex | Contraste |
|---|---|---|---|
| Texto principal, títulos, modo HC | `tinta` | `#0F2A38` | 13.3:1 sobre crema |
| Primario / acción / secundario | `azul` | `#17506B` | 7.8:1 sobre crema |
| Fondo de pantalla / papel | `crema` | `#F5F2EA` | — |
| Decorativo / bordes puntuales | `teal` | `#1E8C8C` | 3.6:1 (solo negrita o ≥18pt) |
| Acento cálido / error | `tierra` | `#9C6B3F` | 4.1:1 (íconos y texto grande) |
| Éxito (relleno) | `verde` | `#5FB548` | 2.3:1 → solo con texto Tinta |
| Advertencia (relleno) | `lima` | `#B5D84A` | 1.5:1 → solo con texto Tinta |

Tints de aviso (fondo claro, texto Tinta 11–12:1):

| Uso | Token | Hex |
|---|---|---|
| Éxito | `exito-bg` | `#E3EBD7` |
| Advertencia | `alerta-bg` | `#E8EDCA` |
| Error | `error-bg` | `#E8DED0` |

Alias legacy (siguen funcionando, no los uses en código nuevo): `noche` →
`#0F2A38`, `turquesa` → `#17506B`, `accent` → `#6B979A`.

Reglas duras: **no blanco puro, no rojo/verde/ámbar de Tailwind.** Verde y Lima
nunca llevan texto Crema (fallan AA) ni se usan como texto.

## Radios

| Elemento | Clase | px |
|---|---|---|
| Inputs, banners | `rounded-campo` | 12 |
| Botones | `rounded-boton` | 16 |
| Tarjetas | `rounded-tarjeta` | 24 |
| Chips, badges | `rounded-chip` | 9999 |

## Paleta (Alto Contraste / variante oscura)

Se lee de `useAccessibility()` → `palette`; **no hardcodees clases HC**.
Resumen de las variantes HC:

| Papel | Variante HC |
|---|---|
| Fondo de pantalla | `bg-noche` (Tinta) |
| Tarjeta | `bg-turquesa` + `border-2 border-crema` |
| Texto fuerte | `text-crema` |
| Texto secundario | `text-crema/80`, tenue `text-crema/60` |
| Chip activo / primario | `bg-crema` + `text-noche` |
| Spinner | `palette.spinner` (`#F5F2EA`) |

En modo claro el spinner es `palette.spinner` (`#17506B`).

---

## Tipografía

- **Bricolage Grotesque** (`font-bricolage`): títulos de pantalla y sección,
  CTA y marca. Solo hay Bold (700) cargada.
- **Inter** (`font-inter`, `font-inter-semibold`, `font-inter-bold`): cuerpo,
  labels, chips y banners. Cargadas 400/600/700.
- **JetBrains Mono** (`font-mono`, `font-mono-medium`, `font-mono-bold`):
  **cifras y metadatos numéricos** (altitud, hectáreas, fechas, ids). Cargadas
  400/500/700. Es el toque "cuaderno de campo" del manual.
- No uses `font-bold`/`font-semibold` sueltos si quieres la familia correcta:
  usá siempre el token de peso (`font-inter-semibold`, `font-mono-medium`).

```tsx
<Text className="text-2xl font-bricolage text-noche">Título de pantalla</Text>
<Text className="text-lg font-bricolage text-noche">Título de tarjeta</Text>
<Text className="font-inter-semibold text-noche">Título de elemento</Text>
<Text className="text-turquesa">Subtítulo</Text>
<Text className="text-xs text-turquesa/70">Fecha, id</Text>
<Text className="font-inter-semibold text-noche">Label de campo</Text>
<Text className="font-mono-medium text-noche">1.850 m s. n. m.</Text>
```

Todos usan `palette.<clave>` en vez de `text-noche` cuando la pantalla está
dentro de la sesión (ve `src/accessibility/context.tsx`). Las pantallas
pre-login (`login`, `register`) usan tokens fijos.

---

## Contenedores

```tsx
// Pantalla simple
<View className="flex-1 gap-6 p-6 ${palette.bg}">

// Pantalla centrada (login, error)
<View className="flex-1 justify-center gap-5 p-6 ${palette.bg}">

// Pantalla con scroll (formularios largos)
<ScrollView
  className="flex-1 ${palette.bg}"
  contentContainerClassName="gap-5 p-6"
  keyboardShouldPersistTaps="handled">

// Tarjeta
<View className="gap-2 rounded-tarjeta border-2 border-turquesa p-4 ${palette.card}">

// Cargando
<View className="flex-1 items-center justify-center ${palette.bg}">
  <ActivityIndicator color={palette.spinner} />
</View>
```

El espaciado entre hijos es `gap-*`, nunca `mt-*` en cada hijo.
`gap-6` entre bloques, `gap-5` entre campos, `gap-3`/`gap-2` dentro de una
tarjeta, `gap-1.5` entre etiqueta y control.

Bordes: interactivos **2 px**, contenedores estructurales **1 px**. Sin sombras
difusas (el manual no las usa; la elevación se da con borde y color).

Toques: todo control mide al menos **48×48 dp** (`min-h-12 min-w-12`).

---

## Botón → usa `Button`

`src/components/Button.tsx` es **el** botón del proyecto.

```tsx
import Button from '../src/components/Button';

// Primario
<Button text="Registrar finca" onPress={handleSubmit(submit)} />

// Secundario (borde 2px azul, sin relleno)
<Button text="Volver" onPress={() => router.back()} secondary />

// Peligro (eliminar, cerrar sesión) → prop danger, no className
<Button text="Eliminar" onPress={handleDelete} danger />

// Deshabilitado mientras se envía: el texto también cambia
<Button
  text={saving ? 'Guardando…' : 'Guardar cambios'}
  onPress={handleSubmit(onSubmit)}
  disabled={saving}
/>
```

Props: `text`, `onPress`, `disabled?`, `secondary?`, `danger?`, `className?`.

Por dentro (referencia, no lo copies):

| Parte | Clases |
|---|---|
| Base | `min-h-12 min-w-12 items-center justify-center rounded-boton p-4 active:opacity-80 disabled:opacity-50` |
| Primario | `bg-turquesa border-2 border-turquesa` + texto `font-bricolage text-crema` |
| Secundario | `border-2 border-turquesa` + texto `font-bricolage text-turquesa` |
| Peligro | `bg-error-bg border-2 border-tierra` + texto `font-bricolage text-tinta` |

---

## Campo de texto → usa `Field`

`src/components/Field.tsx` ya trae etiqueta, foco con `border-noche`, borde
`tierra` al fallar (color + ícono + texto) y el mensaje de error. Solo dentro de
un formulario de react-hook-form.

```tsx
<Field
  control={control}
  name="email"
  label="Correo"
  keyboardType="email-address"
  placeholder="nombre@autonoma.edu.co"
  rules={{
    required: 'El correo es obligatorio',
    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
  }}
/>
```

Input suelto (fuera de un formulario, como el buscador):

```tsx
<TextInput
  className="rounded-campo border-2 border-turquesa bg-crema p-3 text-noche"
  placeholderTextColor={colors.azul}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>
```

Recuerda `placeholderTextColor` como **prop**, no como clase.

---

## Búsqueda → usa `SearchBar`

```tsx
import SearchBar from '../src/components/SearchBar';
<SearchBar value={query} onChangeText={setQuery} placeholder="Buscar…" />
```

Mismo comportamiento de foco que `Field`.

---

## Selección de una opción → usa `Select`

```tsx
<Select control={control} name="severity" label="Severidad" options={SEVERITIES} />
```

`Select` y `ChipFilter` son chips `rounded-chip border-2`: activo
`bg-turquesa text-crema`, inactivo `bg-crema border-turquesa text-noche`
(HC: activo `bg-crema text-noche`). Exponen `accessibilityRole="button"` y
`accessibilityState={{ selected }}`.

---

## Etiqueta de severidad → usa `Badge`

```tsx
<Badge value={crop.healthStatus} />
```

Severidad (✅ AA): `baja` = verde + tinta + `checkmark-circle`; `media` = lima +
tinta + `alert-circle`; `alta` = tinta + crema + `warning` (HC: crema + tinta).
Los estados `activo/inactivo/pendiente/resuelto` conservan su mapa light/dark.
**Valor nuevo del backend ⇒ entrada nueva en el mapa de
`src/components/Badge.tsx`**, no un color en la pantalla.

---

## Avisos → usa `Notice`

Un solo formato para errores de servidor, éxito y advertencias:

```tsx
import Notice from '../src/components/Notice';

{error && <Notice variant="error">{error}</Notice>}
<Notice variant="success">Finca guardada</Notice>
<Notice variant="warning">Sin conexión: mostrando datos locales</Notice>
```

Renderiza `accessibilityRole="alert"`, ícono + texto, fondo `error-bg` /
`exito-bg` / `alerta-bg` (HC: `bg-noche` + borde verde/lima/tierra). No lo
reemplaces por `Text` con clases de color.

Error que impide cargar la pantalla: `<Notice variant="error">` + un
`<Button ... secondary />` para volver.

---

## Lista

```tsx
<FlatList contentContainerClassName="gap-3 p-4" ... />

// Fila pulsable
<Pressable className="gap-2 rounded-tarjeta border-2 border-turquesa p-4 ${palette.card} active:opacity-80">

// Vacío o error
<Text className={`p-6 text-center ${palette.faint}`}>
```

---

## Enlace

```tsx
<Link href="/login" className="text-center text-turquesa">
```
