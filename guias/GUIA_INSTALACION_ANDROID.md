# 🚀 MedCode Pro Palpa v2.0 MEGA — Guía Completa

**Hospital de Apoyo Palpa · UE 407 · Ing. Fernando Mantilla Lozano**

---

## ⚠️ IMPORTANTE: Por qué NO veías los cambios

Fernando, tu celular tenía la **versión anterior cacheada** en el Service Worker. Por eso aunque yo subía cambios nuevos, tu celular seguía mostrando la versión vieja.

**Esta nueva versión:**
1. Tiene un **cache nuevo** (`v2-mega`) que sobrescribe el viejo
2. Usa **"network-first"** para el HTML — siempre busca la última versión
3. **Limpia automáticamente** los caches viejos al instalar

---

## 🔧 PASO A PASO PARA VER LA VERSIÓN MEGA EN TU CELULAR

### Si ya tenías la app instalada:

#### Opción A - LA MÁS FÁCIL (recomendada)
1. **Desinstala la app vieja** de tu celular (mantén presionado el icono → Desinstalar)
2. Sube el **nuevo ZIP** a Netlify (drag-and-drop)
3. Abre la URL de Netlify en Chrome del celular
4. Verás el **splash con "v2.0 MEGA PRO"** los primeros 3 segundos
5. Menú ⋮ → "Agregar a pantalla de inicio"
6. ✅ Ahora tienes la versión nueva

#### Opción B - Sin desinstalar (más técnica)
1. Abre Chrome del celular
2. Ve a `chrome://settings/siteData`
3. Busca tu URL de Netlify
4. Borra los datos del sitio
5. Vuelve a abrir tu URL → cargará la nueva versión

#### Opción C - Forzar update
1. Abre Chrome, ve a tu URL de Netlify
2. Toca menú ⋮ → "Volver a cargar" (o desliza hacia abajo para refrescar)
3. La nueva versión se descargará

---

## 🆕 LO QUE VAS A VER (versión MEGA)

### 1. **Splash al cargar** dice "v2.0 MEGA PRO"
Si no dice eso, todavía tienes la versión vieja cacheada.

### 2. **Header arriba** muestra "v2.0 MEGA" en amarillo
Al lado del contador de códigos.

### 3. **Bottom Nav tiene 4 tabs:**
```
🔍 Buscar    🤖 IA 🔊    ⭐ Favoritos    🛠️ Funciones
```

### 4. **Al abrir el tab IA verás 3 BOTONES GRANDES arriba:**
```
┌──────────────┬────────────────┬───────────┐
│  🔊          │   🔇           │  🗑️       │
│  Escuchar    │  Auto-voz: OFF │  Limpiar  │
└──────────────┴────────────────┴───────────┘
```

**Cómo usar los botones TTS:**
- **🔊 Escuchar:** Toca y la IA leerá la última respuesta en voz alta
- **🔇 Auto-voz OFF:** Toca y se pone verde "🔊 Auto-voz: ON" — desde ese momento la IA habla TODAS sus respuestas automáticamente
- **🗑️ Limpiar:** Borra el historial de chat

### 5. **El primer mensaje de la IA** dice "🎉 ¡Bienvenido a MedCode Pro Palpa MEGA!"

### 6. **Tab Funciones tiene 8 tarjetas:**
```
🧮 Calculadora    📋 Plantillas
🕒 Historial      📤 Exportar
📊 Estadísticas   🔄 Updates
🌓 Tema           ℹ️ Acerca de
```

---

## 🧪 TEST RÁPIDO PARA CONFIRMAR QUE TIENES LA NUEVA

Después de instalar, ve al **tab "Funciones" (último a la derecha)** — si NO ves esta tab, todavía tienes la versión vieja.

Si SÍ ves Funciones:
1. Toca **🧮 Calculadora Médica**
2. Ingresa peso: `70` y talla: `170`
3. Toca "Calcular IMC"
4. Debe mostrarte: **IMC 24.2 kg/m² · Normal · Z000**

---

## 🔊 CÓMO ESCUCHAR A LA IA HABLAR

1. Ve al tab **🤖 IA 🔊**
2. Hazle una pregunta cualquiera: "¿Qué va en el LAB del I10X?"
3. Cuando la IA responda, **toca el botón "🔊 Escuchar"** (el primero arriba)
4. Escucharás la IA leer la respuesta en voz alta 🔊

**Para auto-leer todas las respuestas:**
1. Toca el botón **"🔇 Auto-voz: OFF"** (segundo botón)
2. Se pone verde: **"🔊 Auto-voz: ON"** ✅
3. Desde ese momento cada respuesta se lee automáticamente
4. Te dice: *"Modo auto-voz activado. Ahora escucharás mis respuestas."*

---

## 📦 ARCHIVOS NUEVOS QUE TIENES

| Archivo | Tamaño | Versión cache | Uso |
|---|---|---|---|
| `MedCode_Pro_Palpa_MOBILE.html` | 3.17 MB | v2-mega timestamp | App single-file |
| `MedCode_Pro_Palpa_PWA_PACKAGE.zip` | 0.87 MB | v2-mega-fecha | Hosting + APK |
| `MedCode_Pro_Palpa_v3.html` | 2.85 MB | - | Desktop (PC) |
| `GUIA_INSTALACION_APP.md` | 7 KB | - | Esta guía |

---

## 🔄 RUTINA PARA FUTURAS ACTUALIZACIONES

Cada vez que yo te de una nueva versión, hagamos esto:

1. Descargas los archivos nuevos
2. En Netlify: arrastra y suelta la carpeta nueva del ZIP
3. En tu celular y los demás celulares con la app:
   - El **Service Worker network-first** detecta la nueva versión automáticamente
   - Al abrir la app, descarga la nueva versión en segundo plano
   - Al cerrar y reabrir, ves la versión nueva

Si por alguna razón no se actualiza:
- Tab Funciones → 🔄 Actualizaciones → "Verificar Actualizaciones"
- O desinstala y reinstala como en la Opción A arriba

---

## 💡 LISTA COMPLETA DE FUNCIONES v2.0 MEGA

### 🔍 Buscar
- 27,205 códigos HIS-MINSA
- Voz con 5 idiomas (es-PE, es-ES, es-MX, es-AR, es-CO)
- Dictado offline del teclado
- Muestra confianza de voz en %
- 9 filtros + flechas de scroll visibles
- 6 KPIs deslizables con barras doradas
- Paginación inteligente

### 🤖 IA 🔊
- Chat conversacional con 60+ palabras clave
- 9 tipos de intención detectados (saludos, LAB, ejemplos, etc.)
- Búsqueda fuzzy en toda la base
- **🔊 Botón "Escuchar"** (leer última respuesta)
- **🔇/🔊 Auto-voz toggle** (leer todas automáticamente)
- 4 chips de sugerencias rápidas
- Historial guardado de 50 mensajes

### ⭐ Favoritos
- Marca códigos con estrella
- Persistente en localStorage
- Exportable a CSV/TXT desde Funciones

### 🛠️ Funciones (NUEVO)
1. **🧮 Calculadora Médica:**
   - IMC con clasificación + código sugerido
   - Dosis pediátrica (peso × mg/kg)
   - Edad gestacional + FPP (Naegele)
2. **📋 10 Plantillas Rápidas:**
   - Atención Prenatal Estándar
   - Control HTA + Tamizaje
   - Diabetes Mellitus 2
   - CRED Niño <1 año
   - Caso Probable Dengue
   - Visita Familiar Integral
   - Tamizaje Anemia + Suplem
   - Atención Odontológica
   - ITU en Gestante
   - Crisis Hipertensiva
3. **🕒 Historial:** Últimas 50 búsquedas con timestamp
4. **📤 Exportar:** CSV (Excel) + TXT
5. **📊 Estadísticas:** Top 10 códigos más usados
6. **🔄 Actualizaciones:** Verificar versión
7. **🌓 Tema:** Configurar idioma de voz
8. **ℹ️ Acerca de:** Info completa

---

## 🆘 Si AÚN no ves los cambios

Es posible que tu navegador esté guardando muy fuerte el caché. Prueba:

1. **Cierra Chrome completamente** (no solo minimizar)
2. Ve a Ajustes Android → Apps → Chrome → Almacenamiento → **Borrar caché**
3. Abre Chrome
4. Ve a tu URL de Netlify
5. Verifica que diga **"v2.0 MEGA"** en el header

Si después de esto no funciona:
- Confirma que subiste el ZIP NUEVO a Netlify (no el viejo)
- Verifica en `https://app.netlify.com` que el deploy es reciente
- Mira si el index.html en Netlify pesa **~2.9 MB** (la versión MEGA)

---

**Desarrollador:** Ing. Fernando Mantilla Lozano
**Hospital de Apoyo Palpa — UE 407 - Salud**

*Versión 2.0 MEGA PRO · Mayo 2026*
