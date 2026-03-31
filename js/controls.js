// ============================================================
//  controls.js — Control de gestos con ML5 + Teachable Machine
//  Clases del modelo: "arriba" | "derecha" | "izquierda" | "neutral"
// ============================================================

const Controls = (() => {

  // ── Configuración ────────────────────────────────────────────
  //  REEMPLAZA esta URL con la URL de TU modelo entrenado en
  //  https://teachablemachine.withgoogle.com/train/image
  const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/6j-qh6c2S/';

  // Nombres de clase EXACTOS según tu modelo de Teachable Machine
  const CLASS = {
    UP:      'Arriba',
    RIGHT:   'Derecha',
    LEFT:    'Izquierda',
    NEUTRAL: 'Neutral',
  };

  // Umbral de confianza mínima para considerar un gesto válido (0-1)
  const CONFIDENCE_THRESHOLD = 0.80;

  // ── Estado del control ───────────────────────────────────────
  let _classifier   = null;
  let _video        = null;
  let _ready        = false;
  let _loadError    = false;

  let _currentClass = CLASS.NEUTRAL;
  let _confidence   = 0;
  let _history      = [];           // historial para suavizado
  const HISTORY_LEN = 3;            // frames de suavizado

  // Getters públicos
  const isReady      = () => _ready;
  const hasError     = () => _loadError;
  const getClass     = () => _currentClass;
  const getConfidence= () => _confidence;

  const goLeft  = () => _currentClass === CLASS.LEFT;
  const goRight = () => _currentClass === CLASS.RIGHT;
  const jump    = () => _currentClass === CLASS.UP;
  const isIdle  = () => _currentClass === CLASS.NEUTRAL;

  // ── Inicialización ───────────────────────────────────────────
  function init(videoElement) {
    _video = videoElement;

    if (!MODEL_URL.includes('YOUR_MODEL_ID')) {
      // Cargar modelo real de Teachable Machine
      _classifier = ml5.imageClassifier(MODEL_URL, _video, _onModelReady);
    } else {
      // Modo demo: sin modelo real, usa teclado como fallback
      console.warn('[Controls] No hay URL de modelo TM. Usando modo demo (teclado).');
      _ready     = true;
      _loadError = false;
      _startDemoKeyboard();
    }
  }

  function _onModelReady() {
    console.log('[Controls] Modelo Teachable Machine cargado ✓');
    _ready = true;
    _classify();
  }

  // ── Clasificación continua ────────────────────────────────────
  function _classify() {
    if (!_classifier || !_video) return;
    _classifier.classify(_video, _onResult);
  }

  function _onResult(results) {
    if (!results || results.length === 0) {
      _classify(); return;
    }

    // Encontrar la clase con mayor confianza
    let best = results.reduce((a, b) => a.confidence > b.confidence ? a : b);

    if (best.confidence >= CONFIDENCE_THRESHOLD) {
      // Suavizado temporal: añadir al historial
      _history.push(best.label);
      if (_history.length > HISTORY_LEN) _history.shift();

      // Usar la clase más frecuente en el historial
      const freq = {};
      _history.forEach(c => freq[c] = (freq[c] || 0) + 1);
      _currentClass = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
      _confidence   = best.confidence;
    } else {
      _currentClass = CLASS.NEUTRAL;
      _confidence   = 0;
    }

    _classify(); // loop continuo
  }

  // ── Modo Demo (fallback con teclado cuando no hay modelo TM) ──
  let _keys = { left: false, right: false, up: false };

  function _startDemoKeyboard() {
    // Se integra con los eventos de p5.js via update()
    console.info('[Controls] Modo demo activo: ← → ↑ / A D W / ESPACIO');
  }

  // Llamado cada frame desde sketch.js cuando está en modo demo
  function updateDemo() {
    if (!_loadError && MODEL_URL.includes('YOUR_MODEL_ID')) {
      // Leer teclas de p5 (keyIsDown es global de p5)
      if (typeof keyIsDown !== 'undefined') {
        if      (keyIsDown(LEFT_ARROW)  || keyIsDown(65))  _currentClass = CLASS.LEFT;
        else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68))  _currentClass = CLASS.RIGHT;
        else if (keyIsDown(UP_ARROW)    || keyIsDown(87) ||
                 keyIsDown(32))                            _currentClass = CLASS.UP;
        else                                               _currentClass = CLASS.NEUTRAL;
      }
    }
  }

  // ── API pública ───────────────────────────────────────────────
  return {
    init,
    updateDemo,
    isReady,
    hasError,
    getClass,
    getConfidence,
    goLeft,
    goRight,
    jump,
    isIdle,
    CLASS,
    MODEL_URL,
    CONFIDENCE_THRESHOLD,
  };

})();
