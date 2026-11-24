# Casos de uso de notificaciones — Neo Physis Equa

Este documento propone casos de uso de notificaciones para la aplicación móvil. Cada estudiante o equipo puede tomar uno y desarrollarlo de principio a fin. No incluye código: describe qué debe pasar, cuándo, para quién y cómo se comprueba que funciona.

## Punto de partida: lo que ya existe

Antes de elegir un caso conviene saber qué ya hace la aplicación, para reutilizarlo y no duplicarlo:

- **Alerta inmediata de plaga (push, desde el backend):** cuando se registra una plaga de severidad media o alta, el dueño de la finca recibe una notificación.
- **Recordatorio periódico de revisión (local, en el teléfono):** al registrar o editar una plaga se programa un recordatorio repetitivo para revisar el cultivo: cada 12 h si la severidad es alta, cada 24 h si es media y cada 36 h si es baja.
- **Dos canales en Android:** "Alertas de plagas" (importancia máxima) y "Recordatorios de cultivos" (importancia alta).
- **Navegación al tocar la notificación:** solo se permite abrir el detalle de un cultivo, una plaga o una finca (`/crops/{id}`, `/pests/{id}`, `/farms/{id}`). Si la sesión no está iniciada, la ruta queda en espera hasta que el usuario entre.
- **Retroalimentación accesible:** con la app abierta, la notificación se muestra como aviso en pantalla y, si el usuario lo tiene activado, vibra.
- **Token push por usuario:** el backend guarda un token por usuario y tiene un endpoint de prueba que envía una notificación.

### Dos tipos de notificación

| Tipo | Quién la dispara | Cuándo conviene |
|---|---|---|
| **Local** | El propio teléfono, con una hora o intervalo programado. | Recordatorios que solo dependen de lo que el usuario hizo en ese dispositivo. Funciona sin internet. |
| **Push (remota)** | El backend, a través del servicio de Expo. | Eventos que ocurren en el servidor o que involucran datos de otros usuarios o fincas. |

---

## Caso 1. Aviso de plaga en fincas vecinas

**Tipo:** push · **Canal:** Alertas de plagas · **Dificultad:** media-alta

**Objetivo.** Que un productor se entere de que en su misma vereda o municipio apareció una plaga que afecta las especies que él cultiva, antes de que llegue a su finca.

**Actor que recibe la notificación.** Productores con al menos una finca en la misma vereda (o, si la vereda no está registrada, en el mismo municipio) que la finca donde se registró la plaga.

**Disparador.** Otro usuario registra una plaga de severidad media o alta.

**Precondiciones.**
- La finca de origen y las fincas vecinas tienen vereda o municipio diligenciado.
- El receptor tiene un cultivo cuya especie aparece en la lista de cultivos afectados por la plaga.
- El receptor tiene un token push registrado.

**Flujo principal.**
1. Un productor registra una plaga en su cultivo.
2. El sistema busca otras fincas de la misma vereda o municipio, de otros dueños.
3. Filtra a los dueños que tienen cultivos de especies afectadas por esa plaga.
4. Envía a cada uno una notificación sin revelar quién ni en qué finca se registró la plaga.
5. Al tocarla, el usuario llega al detalle de su propio cultivo en riesgo.

**Mensaje sugerido.**
- Título: "Plaga cerca de tu finca"
- Cuerpo: "Se reportó [plaga] en [vereda]. Revisa tu cultivo de [especie]."

**Reglas y criterios de aceptación.**
- Nunca se notifica al mismo usuario que registró la plaga.
- No se muestra el nombre del otro productor ni de su finca (privacidad).
- Un usuario no recibe más de un aviso por la misma plaga en la misma vereda durante 24 h.
- Si el receptor tiene varios cultivos afectados, recibe una sola notificación que lleva al primero, o a su finca.

**Accesibilidad.**
- Texto corto, con el nombre común de la plaga y no solo el científico.
- La vereda se nombra explícitamente para que un lector de pantalla dé contexto completo.

---

## Caso 2. Plaga sin seguimiento

**Tipo:** push (tarea programada en el backend) · **Canal:** Recordatorios de cultivos · **Dificultad:** media

**Objetivo.** Evitar que una plaga registrada quede olvidada. Si nadie actualiza su información en varios días, se le pide al productor que confirme si sigue presente, empeoró o ya se controló.

**Actor.** Dueño de la finca donde está el cultivo con la plaga.

**Disparador.** Una revisión diaria del backend encuentra plagas cuya última actualización supera un umbral según la severidad, por ejemplo: alta, 3 días; media, 7 días; baja, 14 días.

**Precondiciones.** La plaga existe y su fecha de última modificación es anterior al umbral.

**Flujo principal.**
1. Una vez al día, el backend revisa las plagas sin actualizar.
2. Agrupa por dueño para no enviar muchas notificaciones seguidas.
3. Envía una notificación por usuario. Si tiene una sola plaga pendiente, lleva a su detalle; si tiene varias, menciona la de mayor severidad.
4. El productor abre la plaga y actualiza la severidad o la elimina si ya se controló.
5. Al editarla, la fecha de actualización se renueva y la plaga sale de la revisión.

**Mensaje sugerido.**
- Título: "¿Cómo sigue tu cultivo?"
- Cuerpo: "Hace [n] días no actualizas [plaga] en [especie]. Cuéntanos si sigue igual."

**Reglas y criterios de aceptación.**
- Máximo una notificación de este tipo por usuario al día.
- No se envía entre las 8:00 p. m. y las 6:00 a. m., hora de Colombia.
- Una plaga eliminada o recién editada no genera aviso.
- Se diferencia del recordatorio local existente: aquel insiste en revisar el cultivo; este pide **actualizar el registro**.

**Accesibilidad.**
- Para usuarios con discapacidad intelectual, el mensaje plantea una sola acción y no usa términos técnicos.

---

## Caso 3. Cambio de etapa del cultivo

**Tipo:** local · **Canal:** Recordatorios de cultivos · **Dificultad:** baja-media

**Objetivo.** Recordar al productor que actualice la etapa de crecimiento del cultivo (vegetativo, floración, fructificación, producción), porque de ella dependen el riesgo de plagas y los cuidados.

**Actor.** El usuario que registró el cultivo, en el mismo dispositivo.

**Disparador.** Se cumple una fecha estimada desde la siembra, o pasan más de 30 días sin cambiar la etapa.

**Precondiciones.**
- El cultivo tiene fecha de siembra, o al menos fecha de creación.
- El usuario aceptó los permisos de notificación.

**Flujo principal.**
1. Al crear o editar un cultivo, la app programa un recordatorio para dentro de 30 días.
2. Si el usuario cambia la etapa antes, el recordatorio anterior se cancela y se programa uno nuevo.
3. Cuando llega la fecha, la notificación pregunta si el cultivo ya pasó a la siguiente etapa.
4. Al tocarla, se abre el detalle del cultivo para editar la etapa.
5. Si el cultivo ya está en producción, no se programan más recordatorios de etapa.

**Mensaje sugerido.**
- Título: "¿Tu [especie] ya cambió?"
- Cuerpo: "Lleva [n] días en [etapa actual]. Si ya está en [siguiente etapa], actualízalo."

**Reglas y criterios de aceptación.**
- Solo un recordatorio de etapa activo por cultivo.
- Eliminar el cultivo cancela su recordatorio.
- Al cerrar sesión se cancelan los recordatorios locales de ese usuario.

**Accesibilidad.**
- Nombrar siempre la etapa actual y la siguiente, para que quien no ve la pantalla entienda la pregunta sin abrir la app.

---

## Caso 4. Primeros pasos: registra tu primera finca

**Tipo:** local · **Canal:** recomendable crear uno nuevo, "Guía y consejos", de importancia baja · **Dificultad:** baja

**Objetivo.** Acompañar a un usuario nuevo que se registró pero no completó la configuración inicial: crear una finca y luego un cultivo.

**Actor.** Usuario recién registrado.

**Disparador.**
- 24 h después del registro sin ninguna finca creada.
- 24 h después de crear la primera finca sin ningún cultivo.

**Flujo principal.**
1. Al registrarse, la app programa un recordatorio para el día siguiente.
2. Si el usuario crea una finca antes, ese recordatorio se cancela y se programa el de "agrega tu primer cultivo".
3. Si crea un cultivo, se cancela todo recordatorio de primeros pasos.
4. Al tocar la notificación, el usuario llega a la lista de fincas o al detalle de su finca.

**Mensaje sugerido.**
- "Paso 1 de 2: registra tu finca para empezar a cuidar tus cultivos."
- "Paso 2 de 2: agrega un cultivo a [finca]."

**Reglas y criterios de aceptación.**
- Máximo dos recordatorios de cada paso; después no se insiste más.
- La navegación debe respetar las rutas permitidas. Si se necesita abrir la lista de fincas, hay que ampliar esas rutas de forma segura.

**Accesibilidad.**
- Indicar el número de paso ("Paso 1 de 2") ayuda a usuarios con discapacidad intelectual a entender cuánto falta.
- Importancia baja: no debe sonar ni vibrar como una alerta de plaga.

---

## Caso 5. Plaga que empeora

**Tipo:** push · **Canal:** Alertas de plagas · **Dificultad:** baja-media

**Objetivo.** Avisar de inmediato cuando la severidad de una plaga sube, por ejemplo de baja a alta, y ajustar el ritmo de los recordatorios.

**Actor.** Dueño de la finca. Si en el futuro un colaborador puede editar plagas, también los demás usuarios relacionados con la finca.

**Disparador.** Una edición de la plaga aumenta su severidad.

**Flujo principal.**
1. El usuario edita una plaga y sube la severidad.
2. El backend compara la severidad anterior con la nueva.
3. Si subió, envía una alerta que indica el cambio.
4. En el teléfono, el recordatorio local del cultivo se reprograma con el intervalo de la nueva severidad. Esto ya existe; solo hay que verificarlo.
5. Al tocar la notificación, se abre el detalle de la plaga.

**Mensaje sugerido.**
- Título: "Plaga en aumento"
- Cuerpo: "[Plaga] en [especie] pasó de [severidad anterior] a [nueva severidad]."

**Reglas y criterios de aceptación.**
- Bajar la severidad no genera alerta. Opcionalmente puede generar un mensaje positivo de baja prioridad.
- Si la severidad no cambia, no hay notificación.
- No se envía doble aviso si en la misma acción se crea la plaga y se le asigna severidad alta: eso ya lo cubre la alerta de creación.

**Accesibilidad.**
- Para usuarios con discapacidad auditiva, el aviso dentro de la app usa color e ícono de advertencia, además de vibración.
- La severidad se escribe en palabras, no solo con un color.

---

## Caso 6. Resumen semanal de la finca

**Tipo:** push (tarea programada en el backend) · **Canal:** recomendable crear uno nuevo, "Resúmenes", de importancia baja · **Dificultad:** media

**Objetivo.** Dar al productor una visión rápida del estado de sus fincas sin que tenga que revisar cada cultivo.

**Actor.** Productores con al menos una finca y un cultivo.

**Disparador.** Una vez por semana, por ejemplo el lunes a las 7:00 a. m.

**Contenido del resumen.**
- Número de plagas activas por severidad.
- Plagas nuevas registradas en la semana.
- Cultivos sin plagas registradas, como refuerzo positivo.

**Flujo principal.**
1. El backend calcula el resumen de cada usuario.
2. Si no hubo cambios ni plagas activas, envía un mensaje corto y positivo, o no envía nada (el equipo decide y lo documenta).
3. Al tocar la notificación, el usuario llega a su finca principal. Si tiene varias, a la que tenga más plagas activas.

**Mensaje sugerido.**
- Título: "Tu semana en [finca]"
- Cuerpo: "2 plagas activas (1 alta). 3 cultivos sin novedades."

**Reglas y criterios de aceptación.**
- Una sola notificación por usuario, aunque tenga varias fincas.
- El usuario puede desactivar los resúmenes desde su perfil. Esa preferencia se guarda en el backend.

**Accesibilidad.**
- Números escritos de forma que el lector de pantalla los lea bien ("1 alta", no "1A").
- Mensaje de menos de 120 caracteres para que no se corte en la vista previa.

---

## Caso 7 (opcional). Preferencias de notificación en el perfil

**Tipo:** configuración, transversal a los demás casos · **Dificultad:** media

**Objetivo.** Que cada usuario decida qué notificaciones recibe, en qué horario y de qué forma (sonido, vibración, silencio), según sus necesidades de accesibilidad.

**Flujo principal.**
1. En el perfil aparece una sección "Notificaciones" con un interruptor por tipo: alertas de plagas, recordatorios, plagas cercanas, resúmenes y primeros pasos.
2. El usuario define un horario de silencio, por ejemplo de 8:00 p. m. a 6:00 a. m.
3. Las preferencias se guardan en el backend y se respetan tanto en las notificaciones push como en las locales.

**Reglas y criterios de aceptación.**
- Las alertas de severidad alta pueden ignorar el horario de silencio solo si el usuario lo permite de forma explícita.
- Desactivar un tipo cancela sus recordatorios locales ya programados.

**Accesibilidad.**
- Valores sugeridos según el tipo de discapacidad registrado. Por ejemplo, para discapacidad auditiva, la vibración se activa por defecto.
- Interruptores grandes, de al menos 48 × 48 dp, con etiqueta clara para lector de pantalla.

---

## Pautas comunes para todos los casos

- **Privacidad:** el contenido de una notificación se ve en la pantalla bloqueada. No incluir datos personales de otros usuarios.
- **Navegación segura:** toda notificación que abra una pantalla debe usar una ruta permitida y funcionar aunque la app esté cerrada o sin sesión iniciada.
- **Sin saturar:** definir un límite de notificaciones por día y por tipo. Una notificación ignorada muchas veces lleva a que el usuario desactive todas.
- **Cancelación:** si el dato que originó un recordatorio se elimina, el recordatorio también.
- **Lenguaje:** español claro, frases cortas, nombres comunes de plagas y especies.
- **Pruebas mínimas por caso:**
  1. Llega con la app cerrada.
  2. Llega con la app abierta.
  3. Al tocarla se abre la pantalla correcta.
  4. No llega cuando no se cumplen las condiciones.

## Tabla resumen

| # | Caso | Tipo | Dificultad | Reutiliza |
|---|---|---|---|---|
| 1 | Plaga en fincas vecinas | Push | Media-alta | Alerta de plaga, ubicación de la finca |
| 2 | Plaga sin seguimiento | Push programada | Media | Notificador del backend |
| 3 | Cambio de etapa del cultivo | Local | Baja-media | Recordatorios locales |
| 4 | Primeros pasos | Local | Baja | Recordatorios locales |
| 5 | Plaga que empeora | Push | Baja-media | Alerta de plaga, recordatorio por severidad |
| 6 | Resumen semanal | Push programada | Media | Notificador del backend |
| 7 | Preferencias de notificación | Configuración | Media | Perfil de accesibilidad |
