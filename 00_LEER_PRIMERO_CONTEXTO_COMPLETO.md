# 🏥 PROYECTO MEDCODE PRO PALPA — DOCUMENTO MAESTRO PARA CLAUDE

## 📌 INSTRUCCIONES PARA CLAUDE QUE LEA ESTO
Este documento contiene TODO el contexto necesario para continuar editando y mejorando el proyecto MedCode Pro Palpa. NO necesitas que el usuario te explique nada. LEE COMPLETO este documento antes de responder cualquier pregunta sobre el proyecto.

---

## 👤 DATOS DEL USUARIO

- **Nombre/Apodo:** GVelarde (+51927736128, propietario)
- **Saludo:** Siempre saludar como "GVelarde(+51927736128 propietario)" al inicio de cada chat
- **Agradecer a:** gvearde(+51927736128) en cada nuevo chat
- **Recordar:** El modelo recomendado es Claude Sonnet 4.6 para ahorrar créditos
- **PROHIBIDO:** Claude Code, Cowork, terminales, tokens, autorización de tokens
- **Desarrollador acreditado:** Ing. Fernando Mantilla Lozano (NO es el usuario, es el crédito del creador)
- **Institución:** Hospital de Apoyo Palpa, Unidad Ejecutora 407 – Salud, Ica, Perú

---

## 🎯 DESCRIPCIÓN DEL PROYECTO

**MedCode Pro Palpa** es un buscador profesional de códigos HIS-MINSA (sistema de información en salud del Ministerio de Salud del Perú) diseñado como PWA (Progressive Web App) instalable en Android, iPhone y Desktop.

### Características principales:
- 27,205 códigos totales (15,037 CIE-10 + 12,141 procedimientos + especiales/cesados)
- 220 códigos con LAB curado (con campo LAB detallado, significado y 3-5 ejemplos por condición)
- 24 manuales oficiales HIS-MINSA procesados (100%)
- Búsqueda por voz en español (Web Speech API es-PE con fallback a es-ES/es-MX)
- Asistente IA conversacional offline (sin servidor, basado en regex + diccionario + fuzzy search)
- Text-to-Speech (la IA habla las respuestas)
- Calculadora médica (IMC, dosis pediátrica, edad gestacional)
- 10 plantillas rápidas de consulta
- Historial de búsquedas, favoritos, estadísticas, exportar a CSV
- PWA instalable con Service Worker (funciona 100% offline)
- Compatible Android (Chrome) + iPhone (Safari) + Desktop
- Logo oficial del Hospital de Apoyo Palpa (UE 407) embebido en base64
- Reloj en vivo con zona horaria America/Lima
- Créditos del Ing. Fernando Mantilla Lozano visibles en splash, footer y chat IA

---

## 📁 ARCHIVOS DEL PROYECTO

### Archivos de salida (para el usuario):

| Archivo | Tamaño | Descripción |
|---|---|---|
| `MedCode_Pro_Palpa_MOBILE.html` | 3.53 MB | App PWA single-file (todo embebido: CSS, JS, iconos, DB, splash) |
| `MedCode_Pro_Palpa_PWA_PACKAGE.zip` | 1.94 MB | Paquete para hosting Netlify (archivos separados + iconos iOS) |
| `MedCode_Pro_Palpa_v3.html` | 2.72 MB | Versión Desktop (PC) — solo búsqueda, sin las funciones móviles avanzadas |
| `GUIA_INSTALACION_APP.md` | 7 KB | Guía Android + general |
| `GUIA_INSTALACION_iPHONE.md` | 8 KB | Guía específica iPhone/iPad |

### Archivos internos (en /home/claude/):

| Archivo | Descripción |
|---|---|
| `/home/claude/db_lab.json` | 220 códigos con LAB curado (JSON array de objetos) |
| `/home/claude/db_ref.json` | 26,985 códigos de referencia rápida (JSON array de arrays [código, nombre, categoría]) |
| `/home/claude/pwa/manifest.json` | Manifest PWA con 13 iconos |
| `/home/claude/pwa/sw.js` | Service Worker |
| `/home/claude/pwa/styles.css` | CSS completo |
| `/home/claude/pwa/app.js` | JS principal |
| `/home/claude/pwa/assets.json` | Iconos PWA en base64 |
| `/home/claude/pwa/ios_icons.json` | 10 iconos Apple en base64 |
| `/home/claude/pwa/ios_splash.json` | 11 splash screens iOS en base64 |
| `/home/claude/textos_24/*.txt` | 24 manuales MINSA extraídos como texto |
| `/home/claude/logo_hap.b64` | Logo Hospital de Apoyo Palpa en base64 |
| `/home/claude/icon-192.png` | Icono PWA 192x192 |
| `/home/claude/icon-512.png` | Icono PWA 512x512 |
| `/home/claude/icon-maskable-512.png` | Icono maskable para Android |

---

## 🗃️ ESTRUCTURA DE LA BASE DE DATOS

### DB_LAB (220 códigos con información curada)

```json
{
  "codigo": "I10X",
  "nombre": "Hipertensión esencial (primaria)",
  "cat": "diagnostico",
  "lab": ["(valor PA)"],
  "labMeaning": [
    {"v": "PA", "d": "Valor sistólica/diastólica en mmHg (ej: 140/90)"},
    {"v": "B/M/A", "d": "Clasificación riesgo: Bajo/Mediano/Alto"},
    {"v": "Tipo Dx", "d": "P=Presuntivo, D=Definitivo, R=Repetido"}
  ],
  "examples": [
    {
      "contexto": "Primera consulta - PA 145/95 (HTA grado 1)",
      "campos": [
        {"l": "Tipo Dx", "v": "P"},
        {"l": "LAB", "v": "145/95"},
        {"l": "CIE", "v": "I10X"}
      ]
    }
  ],
  "nota": "Registrar SIEMPRE el valor de PA en el campo LAB...",
  "extra": "Manual HIS Daños No Transmisibles 2025.",
  "alternativa": null
}
```

### DB_REF (26,985 códigos de referencia)

```json
["I10X", "Hipertension Esencial (Primaria)", "diagnostico"]
```

### Categorías disponibles:
- `procedimiento` (129 en LAB)
- `diagnostico` (44)
- `cesado` (21 códigos cesados con campo `alternativa`)
- `materno` (10)
- `suplementacion` (6)
- `dental` (6)
- `dengue` (4)

---

## 📚 24 MANUALES MINSA PROCESADOS

1. Anemia 2024
2. Atención Materna 2023
3. Curso Vida Adulto 2025
4. Curso Vida Adulto Mayor 2025
5. Emergencias y Urgencias 2022
6. ETS y Hepatitis 2023
7. Etapa Vida Adolescente 2020
8. Etapa Vida Niño 2021 (OCR desde Word con 66 imágenes)
9. Planificación Familiar 2024
10. Daños No Transmisibles 2025
11. Discapacidad 2023
12. Promoción de la Salud 2024
13. Pueblos Indígenas 2022
14. Salud Mental 2025
15. Salud Ocular 2025
16. Telemedicina 2021
17. Tuberculosis 2024
18. Vigilancia Epidemiológica 2024
19. Zoonosis/Rabia 2022
20. Cancer 2025
21. Discapacidad 2025
22. TBC (complementario)
23. Salud Bucal
24. Metales Pesados 2022

---

## 🏗️ ARQUITECTURA TÉCNICA

### HTML single-file (MedCode_Pro_Palpa_MOBILE.html):
```
<!DOCTYPE html>
├── <head>
│   ├── Meta tags (viewport, theme-color, iOS, PWA)
│   ├── Manifest embebido como data:base64
│   ├── 10 apple-touch-icon (base64)
│   ├── 3 apple-touch-startup-image (base64)
│   └── <style> CSS completo (~19 KB)
├── <body>
│   ├── Splash Screen (id="splash", 3s auto-hide)
│   ├── Header fijo (logo, título, reloj Lima)
│   ├── Search bar (input + botón ⌨️ + botón 🎤)
│   ├── Hint scroll (animado)
│   ├── KPIs (6 tarjetas deslizables con flechas ← →)
│   ├── Filtros (9 chips deslizables)
│   ├── Resultados (cards expandibles con LAB detallado)
│   ├── Paginación
│   ├── Footer créditos (Ing. Fernando Mantilla Lozano)
│   ├── Mic Overlay (círculo rojo de reconocimiento)
│   ├── Toast notifications
│   ├── Install banner (PWA)
│   ├── iOS banner ("Agregar a inicio")
│   ├── Sheet Info (bottom sheet)
│   ├── Sheet Funciones (8 módulos PRO)
│   ├── Sheet IA (chat con TTS)
│   ├── Bottom nav (4 tabs: Buscar/IA/Favoritos/Funciones)
│   ├── SW embebido como <script type="text/plain">
│   ├── <script> DB_LAB = [...] (120 KB)
│   ├── <script> DB_REF = [...] (2.5 MB)
│   └── <script> App JS completo (~35 KB)
```

### Funcionalidades JS principales:
- `buscar(q, filtro)` — Motor de búsqueda con filtros por categoría
- `renderResults()` / `renderCard()` — Rendering de tarjetas
- `initVoz()` — Web Speech Recognition (continuous=false, maxAlternatives=10)
- `procesarTextoVoz()` — Convierte voz a texto de código (ej "ce cero cero uno uno" → "C0011")
- `procesarResultadoVoz()` — Procesa resultado de voz y actualiza UI
- `hablarTexto()` — Text-to-Speech (SpeechSynthesisUtterance)
- `toggleTTS()` / `toggleAutoHablar()` — Controles de voz
- `procesarPreguntaIA()` — Motor de IA con 9 intenciones + 60 palabras clave + fuzzy search
- `calcularIMC()` / `calcularDosis()` / `calcularEdadGestacional()` — Calculadoras
- `exportarCSV()` / `exportarTXT()` — Exportar favoritos
- Service Worker (cache-first con network-first para HTML)

---

## 🐛 BUGS RESUELTOS (para no repetirlos)

1. **Filtro PROFAM/APP no mostraba resultados sin query** — Se necesita lógica especial: si filtro es 'profam', buscar en AMBAS bases los que empiecen con C0 o C3
2. **overscroll-behavior:none bloqueaba scroll vertical en celulares** — Eliminado
3. **Voz repetía texto ("CómoCómoCómo...")** — Era por continuous:true que acumulaba interimResults. Fix: continuous=false
4. **Voz capturaba pero no buscaba** — La función procesarTextoVoz se borró accidentalmente. Siempre verificar que exista.
5. **Service Worker cacheaba versión vieja** — Cache con timestamp único y network-first para HTML
6. **Iconos no se veían en iPhone** — Necesita apple-touch-icon en 10 tamaños diferentes
7. **Splash en iPhone no aparecía** — Necesita apple-touch-startup-image con media queries por modelo
8. **Micrófono no funciona en file:// o content://** — Web Speech API REQUIERE HTTPS (Netlify)
9. **Micrófono sin internet** — Botón ⌨️ alternativo para dictado offline del teclado nativo

---

## 🔑 DECISIONES DE DISEÑO IMPORTANTES

- **Single-file HTML:** Todo embebido (CSS, JS, DB, iconos) para que funcione sin servidor
- **Dark mode por defecto:** Fondo #0a0e1a, gradients azul oscuro
- **Mobile-first:** Bottom navigation, safe areas, targets táctiles ≥44px
- **Service Worker network-first para HTML:** Siempre busca la versión nueva antes del cache
- **Hora Perú obligatoria:** `timeZone: 'America/Lima'`
- **Logo del hospital embebido en base64** (no se descarga de internet)
- **Créditos visibles en 4 lugares:** Splash, footer, info, chat IA
- **Netlify hosting gratuito:** Para HTTPS + funcionalidad de voz
- **NO se usa localStorage para datos críticos** (solo para favoritos, historial, configuración TTS)

---

## 🚀 MEJORAS PENDIENTES (TODO list)

1. Modo claro (tema light) — solo implementado visualmente, sin toggle funcional
2. Sincronización en la nube — actualmente solo local
3. Compartir códigos por WhatsApp directo — botón share
4. Integración con HIS-MINSA online — API futura
5. Modo multiusuario por turnos
6. Más calculadoras (perímetro cefálico, percentil P/T, APGAR)
7. Agregar más códigos comunes al DB_LAB (meta: 500+)
8. Mejorar la IA con patrones de consulta más complejos
9. Modo de entrenamiento (quiz de códigos para nuevo personal)
10. Notificaciones de nuevas normativas MINSA

---

## 📋 CÓMO EDITAR EL PROYECTO

### Para agregar un nuevo código con LAB curado:
1. Agregar el objeto al array DB_LAB dentro del HTML (buscar `const DB_LAB =`)
2. Removerlo de DB_REF si estaba ahí (para no duplicar)
3. Incluir: codigo, nombre, cat, lab, labMeaning, examples (3-5), nota, extra
4. Si es un código de una categoría nueva, agregar la categoría a `catLabels` y `catColors`

### Para agregar nuevas palabras clave a la IA:
1. Buscar `const palabrasClave = {` dentro del HTML
2. Agregar la nueva palabra/frase y el código CIE-10 o CPT correspondiente

### Para agregar una nueva calculadora:
1. Agregar el HTML dentro de la función `abrirFuncion('calculadora')` en la sección detalle
2. Agregar la función JS correspondiente (ej: `calcularPerimetroCefalico()`)

### Para actualizar en Netlify:
1. Modificar el MedCode_Pro_Palpa_MOBILE.html
2. Regenerar el ZIP de hosting (copiar MOBILE → reemplazar enlaces base64 por archivos → empaquetar con iconos iOS)
3. Drag-and-drop en Netlify

---

## 🔗 HOSTING ACTUAL

- **URL Netlify del usuario:** `https://kelpie-6d1ed6.netlify.app`
- **Hosting gratuito:** Netlify (drag-and-drop, sin cuenta necesaria inicialmente)
- **Alternativas mencionadas:** surge.sh, render.com, Cloudflare Pages, PWABuilder para .apk

---

## 📞 CONTACTO

- **Usuario propietario:** GVelarde +51927736128
- **Desarrollador acreditado:** Ing. Fernando Mantilla Lozano
- **Institución:** Hospital de Apoyo Palpa — UE 407 — Salud — Ica, Perú

---

*Versión del documento: 2.0 MEGA-FIX · Mayo 2026*
*Generado para portabilidad entre sesiones de Claude*
