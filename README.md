# Super Mario Bros 3 — Teachable Machine Edition
**Tarea 2 · Implementación de Juego con P5.js + ML5.js**

---

## Estructura del proyecto

```
tarea2-datos/
│
├── index.html              ← Entrada principal (carga todos los scripts)
│
└── js/
    ├── config.js           ← Constantes, colores, diseño del nivel, STATE global
    ├── entities.js         ← Clases: Mario, Goomba, Coin, Particle, Platform, Pipe, Cloud
    ├── controls.js         ← Módulo ML5 + Teachable Machine (clasificador de imagen)
    ├── level.js            ← Generador del nivel, lógica de colisiones mundo-entidades
    ├── renderer.js         ← TODO el dibujo P5: cielo, tiles, sprites, partículas
    ├── ui.js               ← HUD, pantalla de carga, Game Over, Victoria, preview cámara
    └── sketch.js           ← setup() y draw() de P5 — orquesta todos los módulos
```

---

## Clases del modelo Teachable Machine

| Clase      | Gesto sugerido            | Acción en el juego  |
|------------|---------------------------|---------------------|
| `arriba`   | Mano/brazo levantado      | Mario **SALTA** ▲   |
| `derecha`  | Mano desplazada a la derecha | Mario va ► |
| `izquierda`| Mano desplazada a la izquierda | Mario va ◄ |
| `neutral`  | Mano quieta al centro     | Mario se detiene ■  |

> Los nombres de clase deben coincidir **exactamente** (minúsculas) con los de tu modelo TM.

---

## Cómo configurar el modelo

### 1. Entrenar en Teachable Machine
1. Ve a https://teachablemachine.withgoogle.com/train/image
2. Crea un proyecto de **Imagen estándar**
3. Agrega las 4 clases: `arriba`, `derecha`, `izquierda`, `neutral`
4. Graba ~50-80 muestras por clase
5. Clic en **Entrenar modelo**

### 2. Exportar el modelo
1. Clic en **Exportar modelo**
2. Selecciona la pestaña **Tensorflow.js**
3. Clic en **Subir mi modelo** (hosting gratuito en Google)
4. Copia la URL resultante (formato: `https://teachablemachine.withgoogle.com/models/XXXX/`)

### 3. Configurar en el juego
Abre `js/controls.js` y reemplaza la línea:

```javascript
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/';
```

por la URL de tu modelo.

### 4. Ejecutar localmente
```bash
# Opción A: VSCode Live Server (recomendado)
# Clic derecho en index.html → "Open with Live Server"

# Opción B: Python (solo para servir los archivos, NO para el juego)
python -m http.server 8080
# Luego abre http://localhost:8080 en el navegador

# Opción C: Node.js
npx serve .
```

> Debe correr en un servidor local (no file://) porque la cámara requiere contexto seguro (localhost o HTTPS).

---

## Controles del modo demo (sin modelo TM)

Si `controls.js` tiene `YOUR_MODEL_ID` sin reemplazar, el juego
activa automáticamente el **modo demo con teclado**:

| Tecla       | Acción       |
|-------------|--------------|
| ← / A       | Mover izquierda |
| → / D       | Mover derecha   |
| ↑ / W / Espacio | Saltar     |
| Espacio     | Reiniciar (en Game Over / Victoria) |

---

## Librerías utilizadas (ÚNICAS permitidas)

```html
<!-- P5.js 1.9.0 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>

<!-- ML5.js 1.x -->
<script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>
```

**No se usa ningún otro framework JavaScript.**

---

## Umbral de confianza

En `js/controls.js`, ajusta `CONFIDENCE_THRESHOLD` (por defecto `0.72`):

```javascript
const CONFIDENCE_THRESHOLD = 0.72; // 0.0 - 1.0
```

- Súbelo si hay falsas detecciones frecuentes
- Bájalo si el modelo no responde con suficiente sensibilidad

---

## Responsabilidad de cada archivo

| Archivo       | Responsabilidad |
|---------------|-----------------|
| `config.js`   | Única fuente de verdad para números, colores y layout del nivel |
| `entities.js` | Física, colisiones y estado de cada entidad del juego |
| `controls.js` | Toda la integración ML5/TM; el resto del juego solo llama `Controls.goLeft()` etc. |
| `level.js`    | Construye el nivel, actualiza entidades, maneja señales de colisión |
| `renderer.js` | **Solo dibuja**; no modifica estado |
| `ui.js`       | **Solo dibuja** UI; no modifica estado |
| `sketch.js`   | Orquesta los módulos; contiene setup() y draw() de P5 |
