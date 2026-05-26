# 📱 MedCode Pro Palpa — Guía de Instalación en iPhone/iPad

**Hospital de Apoyo Palpa · UE 407 · Ing. Fernando Mantilla Lozano**

---

## 🎉 BUENA NOTICIA: ¡Mismo archivo, funciona en iPhone!

Fernando, **no necesitas un archivo separado para iPhone**. Tu PWA **YA ES COMPATIBLE** con iOS gracias a las optimizaciones que agregué:

✅ **10 tamaños de iconos** Apple Touch (57x57 hasta 180x180)
✅ **11 splash screens** para todos los modelos de iPhone/iPad
✅ **CSS optimizado** para Safari iOS (notch, gestos, scroll)
✅ **JS específico** para iOS (anti doble-tap zoom, banner instalación)
✅ **Detección automática** de iPhone con instrucciones personalizadas

---

## 📲 INSTRUCCIONES PASO A PASO PARA iPHONE

### 🔧 Requisitos:
- iPhone 5s o superior
- iOS 11.3 o superior (todos los iPhones modernos lo tienen)
- Safari (obligatorio en iOS — Chrome iOS NO funciona para PWAs)

### Paso 1: Subir el ZIP a Netlify (igual que para Android)

1. Descomprime `MedCode_Pro_Palpa_PWA_PACKAGE.zip` en tu PC
2. Ve a **https://app.netlify.com/drop**
3. **Arrastra la carpeta entera** (no solo el index.html)
4. Obtienes una URL: `https://medcode-palpa-xxx.netlify.app`

### Paso 2: Abrir en iPhone con Safari

⚠️ **IMPORTANTE: USA SAFARI, no Chrome iOS**

Chrome en iPhone NO instala PWAs porque Apple bloquea esa función. Safari es el único navegador que puede instalar apps web en iPhone.

1. Toma tu iPhone
2. Abre **Safari** (icono azul con brújula)
3. Pega tu URL de Netlify en la barra
4. Espera que cargue completamente (verás el splash con "v2.0 MEGA-FIX")

### Paso 3: Instalar como app

1. En la parte inferior de Safari, toca el botón **Compartir** ⬆️ (cuadrado con flecha hacia arriba)
2. Desliza hacia abajo en el menú que aparece
3. Busca **"Agregar a inicio"** o **"Add to Home Screen"**
4. Toca esa opción
5. Se abrirá una vista previa con:
   - El **icono del Hospital** (HAP)
   - El nombre **"MedCode Palpa"** (puedes editarlo)
   - La URL
6. Toca **"Agregar"** en la esquina superior derecha
7. ✅ ¡Listo! El icono aparece en tu pantalla de inicio

### Paso 4: Abrir la app

1. Cierra Safari
2. Busca el icono **MedCode Palpa** en tu pantalla de inicio
3. Tócalo
4. ✅ Se abre **a pantalla completa** (sin barra de Safari)
5. Verás el **splash screen personalizado** con el logo del hospital
6. Después aparece la app completa con los **220 códigos LAB curados**

---

## 🎯 DIFERENCIAS ENTRE ANDROID e iPhone

| Función | Android (Chrome) | iPhone (Safari) |
|---|---|---|
| Instalación PWA | ✅ Sí (Chrome) | ✅ Sí (solo Safari) |
| Búsqueda por voz | ✅ Sí (online) | ⚠️ Limitado (Safari iOS no soporta SpeechRecognition) |
| Text-to-Speech (IA habla) | ✅ Sí | ✅ Sí (funciona perfecto) |
| Funciona offline | ✅ Sí | ✅ Sí |
| Notificaciones push | ✅ Sí | ❌ No (Apple no lo permite en PWAs) |
| Acceso desde pantalla inicio | ✅ Sí | ✅ Sí |
| Pantalla completa | ✅ Sí | ✅ Sí |

### ⚠️ Limitación importante de iOS

**Safari iOS NO soporta Web Speech Recognition** (la voz para BUSCAR). Por eso en iPhone:

- ✅ La **IA SÍ habla** las respuestas (Text-to-Speech funciona perfecto)
- ❌ La búsqueda por voz **NO funciona** en Safari iOS (limitación de Apple)
- ✅ **Solución**: usa el **botón ⌨️ TECLADO** que abre el dictado nativo del teclado de iOS (funciona offline y es excelente)

### 💡 Cómo usar el dictado de iPhone:

1. En MedCode Pro, toca el **botón verde ⌨️** (al lado del micrófono)
2. Se abrirá el teclado del iPhone
3. **Toca el micrófono pequeño** ![🎤] dentro del teclado (junto a la barra espaciadora)
4. Habla → se transcribe automáticamente al buscador
5. ✅ La búsqueda se ejecuta sola

---

## 📦 ARCHIVOS QUE TIENES

| Archivo | Tamaño | Compatible con |
|---|---|---|
| `MedCode_Pro_Palpa_MOBILE.html` | 3.53 MB | Android + iPhone (single-file) |
| `MedCode_Pro_Palpa_PWA_PACKAGE.zip` | 1.94 MB | **Para hosting Netlify** (con TODOS los iconos iOS) |
| `MedCode_Pro_Palpa_v3.html` | 2.85 MB | Versión Desktop (PC/Mac) |
| `GUIA_INSTALACION_APP.md` | - | Guía general |
| `GUIA_INSTALACION_iPHONE.md` | - | Esta guía |

El ZIP nuevo contiene:
```
📁 / (raíz)
├── index.html              (~3 MB, app completa)
├── manifest.json           (config PWA con 13 tamaños de iconos)
├── sw.js                   (service worker)
├── icon-192.png            (icono Android estándar)
├── icon-512.png            (icono Android grande)
├── icon-maskable-512.png   (icono Android adaptable)
├── favicon.png             
└── 📁 ios/                 (carpeta iOS específica)
    ├── apple-touch-icon-57x57.png
    ├── apple-touch-icon-60x60.png
    ├── apple-touch-icon-72x72.png
    ├── apple-touch-icon-76x76.png
    ├── apple-touch-icon-114x114.png
    ├── apple-touch-icon-120x120.png
    ├── apple-touch-icon-144x144.png
    ├── apple-touch-icon-152x152.png
    ├── apple-touch-icon-167x167.png
    ├── apple-touch-icon-180x180.png
    └── 📁 splash/
        ├── splash-640x1136.png    (iPhone 5/SE)
        ├── splash-750x1334.png    (iPhone 6/7/8)
        ├── splash-828x1792.png    (iPhone XR/11)
        ├── splash-1125x2436.png   (iPhone X/XS/11 Pro)
        ├── splash-1170x2532.png   (iPhone 12/13/14)
        ├── splash-1242x2208.png   (iPhone Plus)
        ├── splash-1242x2688.png   (iPhone XS Max/11 Pro Max)
        ├── splash-1284x2778.png   (iPhone 12/13/14 Pro Max)
        ├── splash-1536x2048.png   (iPad)
        ├── splash-1668x2388.png   (iPad Pro 11")
        └── splash-2048x2732.png   (iPad Pro 12.9")
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS iPhone

### ❌ "No veo la opción 'Agregar a inicio' en Safari"
- Asegúrate de estar usando **Safari**, no Chrome ni Firefox iOS
- Toca el botón **Compartir** (cuadrado con flecha hacia arriba)
- Desliza el menú hacia abajo — la opción está más abajo

### ❌ "La app no se abre a pantalla completa"
- Verifica que abriste la app desde el **icono en la pantalla de inicio**, no desde el historial de Safari
- Borra el icono y reinstálalo siguiendo los pasos arriba

### ❌ "Veo el splash incorrecto o aparece feo"
- Significa que tu iPhone tiene un tamaño que aún no está optimizado
- Es solo cosmético — la app funciona perfecto
- Mándame el modelo de iPhone que usas para agregar su splash

### ❌ "La voz no funciona en iPhone"
- ⚠️ Es una limitación de Safari iOS (Apple bloquea Web Speech Recognition)
- **Solución**: usa el **botón ⌨️ TECLADO verde** → te abre el dictado nativo
- El dictado de iPhone es excelente y funciona offline

### ❌ "No se actualiza la app"
1. Cierra Safari completamente (deslizar app)
2. Vuelve a abrir el icono de MedCode
3. Si aún no actualiza:
   - Mantén presionado el icono → "Eliminar app"
   - Confirma "Eliminar de pantalla principal"
   - Abre Safari, ve a la URL Netlify
   - Reinstala con "Agregar a inicio"

---

## 🎬 RESUMEN VISUAL DEL FLUJO iPhone

```
1️⃣  PC: Subir ZIP a Netlify
        ↓
2️⃣  iPhone: Abrir Safari
        ↓
3️⃣  iPhone: Ir a URL Netlify
        ↓
4️⃣  iPhone: Compartir ⬆️ → "Agregar a inicio"
        ↓
5️⃣  iPhone: Confirmar "Agregar"
        ↓
6️⃣  iPhone: Tocar icono en pantalla inicio
        ↓
✅  ¡App funcionando con todo!
```

---

## 💰 100% GRATIS

Como siempre con MedCode Pro Palpa:
- ✅ Sin costos de App Store ($99 USD/año al desarrollador para Apple)
- ✅ Sin costo de servidor (Netlify gratis)
- ✅ Sin tarjeta de crédito requerida
- ✅ Sin anuncios
- ✅ Sin recopilación de datos
- ✅ Funciona offline después de instalada

---

## 🏆 RESUMEN DE COMPATIBILIDAD

```
✅ iPhone 5s / SE (2016) ........... iOS 11+
✅ iPhone 6/6+/6s/6s+/7/7+/8/8+ ... iOS 11+
✅ iPhone X/XS/XS Max/XR/11/11 Pro
✅ iPhone 12/12 Pro/12 Pro Max/Mini
✅ iPhone 13/13 Pro/13 Pro Max/Mini
✅ iPhone 14/14 Plus/14 Pro/Pro Max
✅ iPhone 15/15 Plus/15 Pro/Pro Max
✅ iPhone 16/16 Plus/16 Pro/Pro Max
✅ iPad (todos los modelos modernos)
```

---

**Desarrollador:** Ing. Fernando Mantilla Lozano
**Hospital de Apoyo Palpa — UE 407 - Salud**

*Versión 2.0 MEGA-FIX iOS + Android · Mayo 2026*
