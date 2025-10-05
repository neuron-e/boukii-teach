# Release Notes - Versión 1.0.20 (Android) / 1.1.6 (iOS)

## 📋 Textos para las Tiendas

### Google Play Store (Español)
```
¿Qué hay de nuevo en la versión 1.0.20?

✨ Selección de escuela mejorada
• Selecciona fácilmente tu escuela activa al iniciar sesión
• Cambia entre escuelas desde el menú Écoles
• Tus preferencias se guardan automáticamente

📋 Observaciones mejoradas
• Visualiza las notas de la escuela y las observaciones de evaluación por separado
• Mejor organización de la información de cada cliente

📅 Calendario optimizado
• Solución al problema de selección de eventos superpuestos
• Mejor visualización de clases que coinciden en horario
• Diseño responsive para eventos múltiples

🔐 Perfil mejorado
• Nueva funcionalidad para mostrar/ocultar contraseñas

🛠️ Mejoras técnicas
• Soporte para dispositivos Android más recientes
• Optimizaciones de rendimiento y estabilidad
```

### App Store (Inglés)
```
What's new in version 1.1.6?

✨ Improved school selection
• Easily select your active school when logging in
• Switch between schools from the Écoles menu
• Your preferences are automatically saved

📋 Enhanced observations
• View school notes and evaluation observations separately
• Better organization of each client's information

📅 Optimized calendar
• Fixed overlapping event selection issue
• Improved visualization of concurrent classes
• Responsive design for multiple events

🔐 Enhanced profile
• New show/hide password functionality

🛠️ Technical improvements
• Support for newer Android devices
• Performance and stability optimizations
```

### App Store (Francés)
```
Quoi de neuf dans la version 1.1.6 ?

✨ Sélection d'école améliorée
• Sélectionnez facilement votre école active lors de la connexion
• Changez d'école depuis le menu Écoles
• Vos préférences sont automatiquement sauvegardées

📋 Observations améliorées
• Visualisez les notes de l'école et les observations d'évaluation séparément
• Meilleure organisation des informations de chaque client

📅 Calendrier optimisé
• Résolution du problème de sélection d'événements superposés
• Meilleure visualisation des cours simultanés
• Design responsive pour les événements multiples

🔐 Profil amélioré
• Nouvelle fonctionnalité afficher/masquer les mots de passe

🛠️ Améliorations techniques
• Support pour les appareils Android plus récents
• Optimisations de performance et stabilité
```

## 🚀 Cambios Implementados

### Nuevas Funcionalidades
1. **Sistema de selección de escuela**
   - Los monitores con múltiples escuelas pueden seleccionar su escuela activa
   - Preferencias guardadas en localStorage y backend
   - Página de escuelas rediseñada para gestionar cambios

2. **Observaciones mejoradas**
   - Separación de notas de escuela y observaciones de evaluación
   - Mejor visualización en el perfil del cliente

3. **Calendario optimizado**
   - Corrección de eventos superpuestos
   - Ajuste dinámico de anchos y posicionamiento
   - Contenido responsive para eventos estrechos

4. **Perfil mejorado**
   - Toggle para mostrar/ocultar contraseñas

5. **Sistema de actualización forzada** ⭐ NUEVO
   - La app verifica automáticamente si hay actualizaciones disponibles
   - Notifica al usuario para actualizar
   - Ver `APP_VERSION_IMPLEMENTATION.md` para configuración del backend

### Mejoras Técnicas
- Soporte para páginas de memoria de 16 KB (Android)
- Limpieza de console.logs
- Traducciones actualizadas en 5 idiomas

## 📦 Archivos Generados

### Bundle de Android
- **Ubicación**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Versión**: 1.0.20 (código 33)
- **Tamaño**: ~21 MB
- ✅ Incluye soporte para 16KB page sizes

### Versiones
- **Android**: versionCode 33, versionName "1.0.20"
- **iOS**: build 4, version 1.1.6

## 🔧 Configuración Pendiente

### Backend - Sistema de Actualización
Para activar el sistema de actualización forzada, es necesario:

1. Crear tabla `app_versions` en la base de datos
2. Crear endpoint `/api/app-version` en Laravel
3. Configurar versión inicial en BD

Ver instrucciones completas en: `APP_VERSION_IMPLEMENTATION.md`

### iOS - App Store ID
Actualizar en `src/app/services/app-version.service.ts` línea 65:
```typescript
window.open('https://apps.apple.com/app/idYOUR_APP_ID', '_system');
```
Reemplazar `YOUR_APP_ID` con el ID real de la app en App Store.

## ✅ Checklist Pre-Publicación

- [x] Versiones actualizadas en build.gradle y project.pbxproj
- [x] Bundle de Android generado y firmado
- [x] Soporte 16KB page sizes agregado
- [x] Commit y push a repositorio
- [x] Textos preparados para tiendas
- [ ] Configurar backend para sistema de actualización
- [ ] Actualizar App Store ID en servicio de versión
- [ ] Generar IPA de iOS en Xcode
- [ ] Subir bundle a Google Play Console
- [ ] Subir IPA a App Store Connect

## 📝 Notas Adicionales

- El sistema de actualización solo se activa en dispositivos móviles (no afecta versión web)
- Las indisponibilidades en el calendario ya se crean automáticamente en huecos libres
- Todos los países usan códigos ISO con traducciones

## 🔗 Links Útiles

- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com
- **Repositorio**: https://github.com/neuron-e/boukii-teach
