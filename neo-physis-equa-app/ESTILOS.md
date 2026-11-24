# Estilos estándar · Agro Physis móvil

Sistema de diseño "biofilia funcional" del Documento de visión: cálido, colores del
campo y formas orgánicas **solo en lo decorativo**. Cuando estética y accesibilidad
chocan, gana la accesibilidad (meta WCAG 2.1 AA).

Regla base: **primero el componente, después la clase suelta.** Si algo se repite
tres veces, se vuelve componente en `src/components/`. Nunca un hex en una pantalla.

---

## Capas de tokens

| Capa | Archivo | Qué contiene |
|---|---|---|
| Primitivos | `src/theme/colors.json` | Los hex. Única fuente: la leen Tailwind y `tokens.ts`. |
| Tokens | `src/theme/tokens.ts` | `colors`, `gradients`, `radius`, `fonts`, `type`, `space`, `motion`. |
| Semántica | `src/theme/palette.ts` | Roles (`title`, `card`, `input`…) en claro y alto contraste. |
| Acceso | `useAccessibility()` | Devuelve `palette` y `highContrast` según el perfil del usuario. |

Las pantallas usan `palette.<rol>` y `type.<nivel>`; nunca `text-tinta` directo salvo
dentro de un componente base.

## Paleta

| Token | Hex | Uso permitido |
|---|---|---|
| `tinta` | `#0F2A38` | Texto principal (13.3:1 sobre crema). Fondo del alto contraste. |
| `azul` | `#17506B` | Primario, bordes interactivos, texto secundario (7.8:1). |
| `crema` | `#F5F2EA` | Fondo de pantalla; texto sobre azul/tinta. |
| `papel` | `#FBF9F4` | Superficie de tarjetas, campos y botón secundario. |
| `salvia`, `bruma` | `#E8EEDF`, `#DCEAE4` | Solo dentro del degradado de fondo. |
| `liquen` | `#36596A` | Texto tenue (`palette.faint`) y placeholder. ≥ 5.3:1 en todo el fondo. |
| `teal` | `#1E8C8C` | Decoración y degradados (3.6:1: nunca texto de cuerpo). |
| `tierra` | `#9C6B3F` | Error y peligro: bordes y texto grande (4.1:1). |
| `verde` | `#5FB548` | Solo relleno con texto Tinta (5.8:1). |
| `lima` | `#B5D84A` | Relleno con Tinta (9.2:1) o acento sobre azul/tinta (≥ 5.3:1). |
| `abismo` | `#0A1F2A` | Fondo profundo del alto contraste. |
| `exito-bg`, `alerta-bg`, `error-bg` | | Fondos de avisos con texto Tinta (≥ 11:1). |

Reglas duras: no blanco puro, no rojos/verdes/ámbar de Tailwind, verde y lima nunca
como texto sobre claro. Los alias `noche`, `turquesa` y `accent` ya no existen.

## Degradados

`style={{ backgroundImage: gradients.x }}` (React Native 0.88 y web los dibujan sin
librerías). Siempre con un `backgroundColor` de respaldo.

| Token | Dónde | Contraste verificado |
|---|---|---|
| `backdrop` / `backdropHc` | Fondo de toda pantalla (`<Screen>`) | Tinta, Azul y Liquen ≥ 5.3:1 en el punto más oscuro |
| `brand` | Encabezados de navegación y `<BrandHero>` | Crema ≥ 4.9:1, Lima ≥ 5.3:1 |
| `action` / `actionHc` | Botón primario | Crema ≥ 6:1 / Tinta ≥ 9.2:1 donde cae el texto |
| `leaf` | Medallones, ítem activo del menú, progreso | Tinta ≥ 5.8:1 |

Los degradados decoran; nunca llevan información. Ningún texto pequeño va sobre teal.

## Tipografía (`type` en `tokens.ts`)

| Token | Clases | Uso |
|---|---|---|
| `display` | `text-3xl font-bricolage` | Títulos de héroe |
| `title` | `text-2xl font-bricolage` | Título de pantalla |
| `heading` | `text-xl font-bricolage` | Título de tarjeta o sección |
| `subheading` | `text-lg font-inter-semibold` | Nombre de un elemento (finca, cultivo) |
| `body` | `text-base font-inter` | Párrafos |
| `caption` | `text-sm font-inter` | Descripciones y metadatos |
| `label` | `text-base font-inter-semibold` | Etiqueta de campo |
| `data` | `text-sm font-mono-medium` | Cifras: altitud, fechas, conteos |

Los títulos llevan `accessibilityRole="header"`.

## Geometría y espaciado

- Radios: `rounded-campo` 12 (campos, avisos), `rounded-boton` 16, `rounded-tarjeta` 24, `rounded-chip` pill.
- Bordes: 2 px en interactivos, 1 px en tarjetas. Sin sombras.
- Toques: botones 56 dp (`min-h-14`), resto ≥ 48 dp (`min-h-12 min-w-12`).
- Margen de pantalla `space.gutter` (24). `gap-5` entre bloques y campos, `gap-3` dentro de tarjetas, `gap-1.5` etiqueta–control. Nunca `mt-*` en cada hijo.
- Forma orgánica: solo el medallón de hoja (`IconBadge`) y la curva inferior del héroe.

## Movimiento

Transición `fade_from_bottom` de `motion.screenMs` (220 ms) entre pantallas; ninguna
si el sistema pide reducir movimiento (`useReducedMotion`). Sin animaciones en bucle.

---

## Componentes

| Componente | Para qué |
|---|---|
| `Screen` | Raíz de toda pantalla: aplica el degradado de fondo. |
| `LoadingView` | Carga a pantalla completa; el `label` dice qué se carga. |
| `BrandHero` | Bloque de marca con degradado. `bleed` = a todo lo ancho con curva (login, registro, menú). |
| `ScreenTitle` | Medallón + título + subtítulo + `action` opcional. |
| `Card` | Superficie estándar. Con `onPress` es botón y muestra chevron. |
| `IconBadge` | Medallón de hoja con ícono o letra. Decorativo, oculto al lector. |
| `EmptyState` | Vacío con causa y la acción que lo llena (`children`). |
| `Button` | `primary` (degradado), `secondary`, `danger`; `icon` acompaña al texto. |
| `TextField` / `Field` | Campo suelto / conectado a react-hook-form. Foco y error con color + ícono + texto. |
| `SearchBar` | `TextField` con ícono de lupa y rol `search`. |
| `Chip`, `Select`, `ChipFilter` | Selección. Activo = relleno + check. `Select` anuncia radios. |
| `Badge` | Estado (severidad, etapa…). Valor nuevo ⇒ entrada en `BADGES`. `label` para texto legible. |
| `Notice` | Aviso de error/éxito/advertencia con región viva. |
| `ConfirmModal` | Confirmación destructiva. |

```tsx
<Screen>
  <KeyboardAwareScrollView
    contentContainerStyle={{ gap: 20, padding: space.gutter, paddingBottom: insets.bottom + 40 }}
  >
    <ScreenTitle icon="leaf" title="Mi finca" subtitle="Gestiona los datos de tu terreno" />
    {saved ? <Notice variant="success">Cambios guardados</Notice> : null}
    <Card className="gap-5">
      <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>Editar datos</Text>
      <Field control={control} name="name" label="Nombre *" rules={rules.name} />
      <Button text="Guardar cambios" icon="save-outline" onPress={onSubmit} />
    </Card>
    <Button text="Eliminar finca" icon="trash-outline" danger onPress={requestDelete} />
  </KeyboardAwareScrollView>
</Screen>
```

## Alto contraste

Fondo Tinta→Abismo, tarjetas Azul con borde Crema 2 px, texto Crema, foco y selección
en Lima. Lo resuelve `palette`; no se escriben clases HC en las pantallas.

## Íconos

Ionicons, siempre junto a texto: contorno (`leaf-outline`) en reposo y lleno (`leaf`)
cuando está activo. Fincas `leaf`, cultivos `nutrition`, plagas `bug`, diagnóstico
`medkit`, perfil `person`. Nada de flechas "→" o "+" escritas en el texto del botón:
van como `icon`.
