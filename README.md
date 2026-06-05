# DERIVA — El Plano Ecuacional

Juego de plataformas 2D donde la física del personaje está gobernada por cálculo diferencial e integral. Proyecto final de Cálculo 1, Ingeniería de Software.

---

## Derivadas aplicadas

El terreno de cada nivel está definido por una función matemática `f(x)`. En cada frame, el juego calcula la derivada numérica en la posición del jugador usando diferencias finitas centradas:

```
f'(x) ≈ [f(x + h) − f(x − h)] / (2h)    con h = 0.8
```

Esta derivada **modifica la velocidad horizontal del personaje**: en pendiente positiva (`f'(x) > 0`) el personaje desacelera al subir; en pendiente negativa acelera al bajar, simulando gravedad tangencial.

Los **puntos críticos** se detectan donde `f'(x) ≈ 0` (cambio de signo). Se clasifican usando la segunda derivada:

```
f''(x) ≈ [f(x + h) − 2f(x) + f(x − h)] / h²
```

- `f''(x) < 0` → **máximo local** (cima): aparece como ⭐ trampolín amarillo
- `f''(x) > 0` → **mínimo local** (valle): aparece como ◆ coleccionable verde (+20 energía)

Los **enemigos** se colocan donde `f(x) < umbral`, es decir, en las regiones más bajas del terreno.

---

## Integral de Riemann

La energía del jugador se acumula como la integral de la velocidad en el tiempo:

```
E = ∫ v(t) dt ≈ Σ v(tᵢ) · Δt      (suma de Riemann izquierda)
```

El juego registra un historial de velocidades `v(tᵢ)` en los últimos 4 segundos (240 muestras a 60 fps). La suma de Riemann aproxima el área bajo la curva de velocidad, que físicamente representa la **distancia recorrida** — energía cinética acumulada.

El parámetro **N** (teclas `[` y `]`) controla el número de subdivisiones del visualizador:
- N pequeño → rectángulos anchos, menor precisión visual
- N grande → rectángulos delgados, la suma se acerca más a la integral exacta

La barra de energía muestra el progreso hacia el umbral necesario para activar el portal del nivel.

---

## Stack técnico

- **p5.js v1.9.4** via CDN (sin npm, sin bundler)
- Vanilla JavaScript ES6+
- Canvas fijo 800 × 500 px
- Desplegado en **Vercel** como sitio estático

### Correr localmente

Abre `index.html` con un servidor local (por ejemplo Live Server en VS Code). No funciona abriendo el archivo directamente en el navegador por restricciones CORS de algunos navegadores.

```bash
# Con Python
python -m http.server 8080

# Con Node.js
npx serve .
```

### Controles

| Acción       | Tecla                  |
|--------------|------------------------|
| Moverse      | A/D o ←/→              |
| Saltar       | W, Espacio o ↑         |
| Panel math   | H (toggle)             |
| Subdivisiones N | [ / ]               |
| Pausa        | ESC                    |
