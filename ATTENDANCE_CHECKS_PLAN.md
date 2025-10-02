# Teach (Ionic) — Checks de Asistencia en Cursos

Este resumen explica dónde está hoy el flujo de asistencia en la app Teach y dos opciones para añadir un check rápido de asistencia en el listado de alumnos del curso.

## Contexto actual

- Pantalla existente: Confirmación de asistencia
  - Ruta: `course-participation/:id/:date/:course`
  - Archivos:
    - HTML: `teach/src/app/pages/course-participation/course-participation.page.html`
    - TS: `teach/src/app/pages/course-participation/course-participation.page.ts`
  - Comportamiento:
    - Lista de clientes del curso, con un checkbox por cada fecha pasada/hoy: `[(ngModel)]="date.attended"`.
    - Guardado con `saveConfirm()`: hace `PUT /booking-users/:id` por cada booking_user (elimina campos `client, created_at, deleted_at, updated_at` antes de enviar).

- Acceso desde `course-detail`:
  - Vista: `teach/src/app/pages/course-detail/course-detail.page.html`.
  - Muestra icono “user-tick” si `selectedBooking.course.confirm_attendance` y navega a `course-participation`.

## Objetivo

Añadir un check de asistencia más directo:
1) En el listado de alumnos de `course-detail` (rápido para el día/fecha seleccionada).
2) Opcionalmente, en `course-detail-level` (detalle por alumno), para ver/ajustar su asistencia dentro del curso.

## Opciones de implementación

### Opción A — Check inline en `course-detail` (listado de alumnos)

- Dónde:
  - HTML: `teach/src/app/pages/course-detail/course-detail.page.html` (dentro del `*ngFor` de `selectedBooking.all_clients`).
  - TS: `teach/src/app/pages/course-detail/course-detail.page.ts`.

- Datos necesarios:
  - Cargar `booking_users` del curso: `GET /teach/courses/:courseId` (ya usado en `course-participation`).
  - Filtrar por:
    - `monitor_id === monitorData.id` (solo los del monitor activo).
    - Fecha igual a la seleccionada: para colectivos usar `selectedBooking.course_date_id`; para privados, usar `dateBooking` y su rango horario.

- Estado propuesto:
  - `attendanceByClient: Map<number, { id: number; attended: boolean }>` donde la clave es `client_id` y el valor incluye el `booking_user.id` para persistir.

- Render:
  - Mostrar un checkbox pequeño al lado del alumno si `selectedBooking.course.confirm_attendance` y la fecha no es futura.
  - Binding seguro:
    - Lectura: `isAttended(client.id)`
    - Escritura: `(ionChange)/(ngModelChange) => onToggle(client.id, $event)`

- Persistencia:
  - `PUT /booking-users/:id` con el objeto booking_user de esa fecha/cliente.
  - Reutilizar el patrón de `course-participation`: clonar booking_user y eliminar `client, created_at, deleted_at, updated_at`.
  - Feedback con `ToastrService` y `SpinnerService` (ya presentes).

- Pros/Contras:
  - Pros: flujo rápido (un solo toque por alumno), sin cambiar de pantalla.
  - Contras: solo aplica a la fecha seleccionada; para multi-día, sigue siendo útil `course-participation`.

### Opción B — Check en `course-detail-level` (por alumno)

- Dónde:
  - HTML: `teach/src/app/pages/course-detail-level/course-detail-level.page.html`.
  - TS: `teach/src/app/pages/course-detail-level/course-detail-level.page.ts`.

- Comportamiento:
  - Tarjeta “Asistencia” con lista de fechas del curso del alumno (`booking_users` filtrados por `client_id`) y sus checkboxes.
  - Persistencia idéntica al caso A (PUT `booking-users/:id`).

- Pros/Contras:
  - Pros: foco por alumno; buen lugar junto a la evaluación de nivel.
  - Contras: más clics si el monitor quiere marcar a varios alumnos rápidamente.

## Recomendación

- Implementar primero Opción A (inline en `course-detail`) para un marcaje rápido el día de la clase y mantener la pantalla `course-participation` para casos multi-día.
- Opción B queda como mejora adicional si queréis editar la asistencia desde el detalle del alumno.

## Diseño técnico (Opción A)

1) TS (`course-detail.page.ts`)
   - Añadir estado:
     - `attendanceByClient = new Map<number, { id: number; attended: boolean }>();`
   - Al seleccionar `selectedBooking` (en `selectBooking` o tras `processBookings`):
     - `loadAttendance(selectedBooking.course_id)`:
       - `teachService.getData('teach/courses', courseId)` → `data.data.booking_users`.
       - Filtrar por monitor y fecha actual del `selectedBooking`.
       - Rellenar `attendanceByClient` con `{ id: booking_user.id, attended: booking_user.attended }` indexado por `client_id`.
   - Handlers:
     - `isAttended(clientId: number): boolean` → lee del `Map`.
     - `onToggle(clientId: number, checked: boolean)`:
       - localiza `{ id }` en el `Map`.
       - compone `payload` (clon de booking_user con `attended` actualizado; eliminar campos no permitidos si es necesario).
       - `teachService.updateData('booking-users', id, payload)` + spinner + toast; refrescar mapa.

2) HTML (`course-detail.page.html`)
   - Dentro del `*ngFor="let client of selectedBooking.all_clients"`:
     - Mostrar checkbox si `selectedBooking.course.confirm_attendance` y la fecha no es futura.
     - Ejemplo inline (pseudocódigo Angular):

```html
<label *ngIf="selectedBooking.course.confirm_attendance && !isFutureDate(dateBooking)" class="simple-check-option-small">
  <input type="checkbox"
         [checked]="isAttended(client.id)"
         (change)="onToggle(client.id, $event.target.checked)" />
  <div class="custom-check-small"></div>
</label>
```

3) Utilidades ya disponibles:
   - `SpinnerService`, `ToastrService`, `TranslateService`.
   - `TeachService.updateData('booking-users', id, data)`.
   - Lógica de limpieza de payload: ver `course-participation.page.ts` (`removeFieldsFromObject`).

## Edge cases

- Solo marcar fechas que no sean futuras (ya existe `isDateBeforeOrEqualToToday` en `course-participation`).
- Colectivos vs privados:
  - Colectivos: fecha por `course_date_id`.
  - Privados: usar `dateBooking` y horas para identificar correctamente el booking_user del día.
- Monitores múltiples: filtrar por `monitor_id` del monitor logado (`monitorData.id`).
- Offline: hoy no hay capa offline; depender del servidor para persistencia.

## Endpoints

- GET `teach/courses/:courseId` → `booking_users` (fuente para `attended`).
- PUT `booking-users/:id` → persistir `attended`.

---

Si confirmáis Opción A, preparo el patch con `loadAttendance`, handlers, y el checkbox en `course-detail`.

