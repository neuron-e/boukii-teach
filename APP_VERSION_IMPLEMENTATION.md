# Sistema de Actualización Forzada de App

## Descripción
Este sistema verifica automáticamente si hay una nueva versión de la app disponible y muestra un mensaje al usuario para que actualice.

## Configuración del Backend

### 1. Crear tabla en la base de datos

```sql
CREATE TABLE app_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    android_version VARCHAR(20) NOT NULL,
    android_version_code INT NOT NULL,
    ios_version VARCHAR(20) NOT NULL,
    force_update BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar versión inicial
INSERT INTO app_versions (android_version, android_version_code, ios_version, force_update)
VALUES ('1.0.20', 33, '1.1.6', TRUE);
```

### 2. Crear endpoint en Laravel

Crear el controlador `app/Http/Controllers/Api/AppVersionController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppVersionController extends Controller
{
    /**
     * Get current minimum required app version
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVersion()
    {
        try {
            $version = DB::table('app_versions')
                ->orderBy('id', 'desc')
                ->first();

            if (!$version) {
                return response()->json([
                    'success' => false,
                    'message' => 'No version found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'android_version' => $version->android_version,
                    'android_version_code' => $version->android_version_code,
                    'ios_version' => $version->ios_version,
                    'force_update' => $version->force_update
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching version: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update minimum required version (Admin only)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateVersion(Request $request)
    {
        $request->validate([
            'android_version' => 'required|string',
            'android_version_code' => 'required|integer',
            'ios_version' => 'required|string',
            'force_update' => 'boolean'
        ]);

        try {
            DB::table('app_versions')->insert([
                'android_version' => $request->android_version,
                'android_version_code' => $request->android_version_code,
                'ios_version' => $request->ios_version,
                'force_update' => $request->force_update ?? true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Version updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating version: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

### 3. Registrar rutas en `routes/api.php`:

```php
// Public route - no authentication required
Route::get('/app-version', [AppVersionController::class, 'getVersion']);

// Protected route - only for admins
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::post('/app-version', [AppVersionController::class, 'updateVersion']);
});
```

## Uso

### Cuando se lanza una nueva versión:

1. **Actualizar versiones en el frontend** (`app-version.service.ts`):
```typescript
private readonly currentVersion = {
  android: '1.0.21',  // Nueva versión Android
  ios: '1.1.7',        // Nueva versión iOS
  versionCode: 34      // Nuevo código de versión
};
```

2. **Actualizar en el backend** (hacer POST a `/api/app-version`):
```json
{
  "android_version": "1.0.21",
  "android_version_code": 34,
  "ios_version": "1.1.7",
  "force_update": true
}
```

3. Usuarios con versiones antiguas verán automáticamente el mensaje de actualización.

## Comportamiento

- **Actualización forzada** (`force_update: true`): El usuario NO puede cerrar el mensaje, debe actualizar.
- **Actualización opcional** (`force_update: false`): El usuario puede posponer la actualización.

## Verificación

La verificación se hace:
- Al iniciar la app
- Solo en dispositivos móviles (Android/iOS)
- No afecta a la versión web

## App Store IDs

Actualizar en `app-version.service.ts`:
- **Android**: `com.quental.boukii.boukii`
- **iOS**: Reemplazar `YOUR_APP_ID` con el ID real de App Store

## Notas Importantes

⚠️ **No olvides actualizar el versionCode/versionName en cada release:**
- `android/app/build.gradle`: `versionCode` y `versionName`
- `ios/App/App.xcodeproj/project.pbxproj`: `MARKETING_VERSION` y `CURRENT_PROJECT_VERSION`
- `src/app/services/app-version.service.ts`: versiones en `currentVersion`
