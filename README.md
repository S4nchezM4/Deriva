# DERIVA — El Plano Ecuacional

Juego de plataformas 2D donde el terreno está definido por funciones matemáticas y el conocimiento de derivadas e integrales es mecánica de juego real. Proyecto final de Cálculo 1, Ingeniería de Software.

---

## Cómo se juega

El objetivo de cada nivel es acumular suficiente **energía cinética** (∫v dt) para activar el portal al final del mapa. Hay tres niveles con funciones de dificultad creciente.

**El bucle principal:**
1. Te mueves por el terreno f(x). La pendiente afecta tu velocidad.
2. Al acercarte a un punto crítico (★ máximo / ◆ mínimo), el juego **pausa** y te pregunta qué tipo es.
3. Respondes con `M` (máximo) o `N` (mínimo) en 5 segundos.
4. Acierto → bonus (superjump en máximos, +20 energía en mínimos). Error → aparece una **anomalía corrupta** (enemigo naranja) en esa posición.
5. Los enemigos rojos patrullan en zonas donde f(x) < umbral. Se eliminan saltándoles encima.
6. Con energía suficiente, el portal se activa y puedes pasar al siguiente nivel.

---

## Derivadas en el juego

El terreno de cada nivel es la gráfica de una función f(x). En cada frame, el juego calcula:

```
f'(x) ≈ [f(x + h) − f(x − h)] / (2h)    h = 0.8
```

Esta derivada **modifica tu velocidad horizontal**: pendiente positiva frena al subir, pendiente negativa acelera al bajar. El panel `ANÁLISIS f(x)` (tecla H) muestra f(x), f'(x) y f''(x) en tiempo real.

**Puntos críticos** — se detectan donde f'(x) cambia de signo (f'(x) = 0):

```
f''(x) ≈ [f(x + h) − 2f(x) + f(x − h)] / h²
```

- f''(x) < 0 → **máximo local** ★ (cima)
- f''(x) > 0 → **mínimo local** ◆ (valle)

**Los enemigos** aparecen donde f(x) < umbral del nivel, es decir, en las regiones más profundas del terreno.

---

## Integral de Riemann

La energía se acumula como integral de la velocidad en el tiempo:

```
E = ∫ v(t) dt ≈ Σ v(tᵢ) · Δt
```

El panel inferior derecho visualiza la curva v(t) con su suma de Riemann. La barra superior muestra `E actual / meta`. Al llegar al portal con E ≥ meta, el nivel termina.

El parámetro **N** (teclas `[` y `]`) cambia el número de subdivisiones del visualizador — con N grande, los rectángulos se acercan más a la integral exacta.

---

## Niveles

| # | Nombre | Función |
|---|--------|---------|
| 1 | Ondas Armónicas | `f(x) = 80·sin(0.015x) + 40·sin(0.03x)` |
| 2 | Cúbica Caótica | `f(x) = 80·((x−2000)/2000)³ + 50·cos(0.022x)` |
| 3 | Resonancia Final | `f(x) = 100·sin(0.01x)·cos(0.025x) + 30·sin(0.05x)` |

---

## Controles

| Acción                      | Tecla          |
|-----------------------------|----------------|
| Moverse                     | A/D o ←/→      |
| Saltar                      | W, Espacio o ↑ |
| Clasificar anomalía: máximo | M              |
| Clasificar anomalía: mínimo | N              |
| Subdivisiones N             | [ / ]          |
| Panel f(x)                  | H (toggle)     |
| Pausa                       | ESC            |

---

## Correr localmente

Abre `index.html` con un servidor local. En la mayoría de navegadores modernos también funciona abriéndolo directamente, pero algunos bloquean módulos JS locales por CORS.

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Luego abre `http://localhost:8080`.

---

## Stack técnico

- **p5.js v1.9.4** via CDN — sin npm, sin bundler
- Vanilla JavaScript ES6+, canvas fijo 800 × 500 px
- Deploy estático en Vercel
