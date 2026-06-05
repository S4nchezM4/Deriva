function derivative(f, x, h = 0.8) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

function secondDerivative(f, x, h = 0.8) {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

function riemannSum(samples, dt) {
  return samples.reduce((acc, s) => acc + s.v * dt, 0);
}

function findCriticalPoints(f, xStart, xEnd, step = 12) {
  const points = [];
  for (let x = xStart; x < xEnd; x += step) {
    const d1 = derivative(f, x);
    const d1next = derivative(f, x + step);
    if (Math.abs(d1) < 0.6 || (d1 * d1next < 0)) {
      const d2 = secondDerivative(f, x);
      if (Math.abs(d2) > 0.8) {
        points.push({ x, type: d2 < 0 ? 'max' : 'min' });
      }
    }
  }
  return points;
}
