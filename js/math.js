function derivative(f, x, h = 0.8) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

function secondDerivative(f, x, h = 0.8) {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

function riemannSum(samples, dt) {
  return samples.reduce((acc, s) => acc + s.v * dt, 0);
}

function findCriticalPoints(f, xStart, xEnd, step = 12, minSpacing = 180) {
  const points = [];
  let lastX = -minSpacing;
  for (let x = xStart; x < xEnd; x += step) {
    if (x - lastX < minSpacing) continue;
    const d1 = derivative(f, x);
    const d1next = derivative(f, x + step);

    if (d1 * d1next < 0) {
      // Sign change in f'(x): d1 > 0 means we were ascending → now descending = MAX
      points.push({ x, type: d1 > 0 ? 'max' : 'min' });
      lastX = x;
    } else if (Math.abs(d1) < 0.3) {
      // Very flat but no clear crossover: fall back to f''(x) sign
      const d2 = secondDerivative(f, x);
      if (Math.abs(d2) > 0.02) {
        points.push({ x, type: d2 < 0 ? 'max' : 'min' });
        lastX = x;
      }
    }
  }
  return points;
}
