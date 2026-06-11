const LEVELS = [
  {
    name: "Nivel 1 — Ondas Armónicas",
    fn: (x) => 80 * Math.sin(x * 0.015) + 40 * Math.sin(x * 0.03),
    fnStr: "f(x) = 80·sin(0.015x) + 40·sin(0.03x)",
    enemyThreshold: -15,
    energyGoal: CONFIG.ENERGY_THRESHOLDS[0],
  },
  {
    name: "Nivel 2 — Cúbica Caótica",
   
    fn: (x) => {
      const t = (x - 2000) / 2000;
      return 80 * Math.pow(t, 3) + 50 * Math.cos(x * 0.022);
    },
    fnStr: "f(x) = 80·((x-2000)/2000)³ + 50·cos(0.022x)",
    enemyThreshold: -20,
    energyGoal: CONFIG.ENERGY_THRESHOLDS[1],
  },
  {
    name: "Nivel 3 — Resonancia Final",
    fn: (x) => 100 * Math.sin(x * 0.01) * Math.cos(x * 0.025) + 30 * Math.sin(x * 0.05),
    fnStr: "f(x) = 100·sin(0.01x)·cos(0.025x) + 30·sin(0.05x)",
    enemyThreshold: -18,
    energyGoal: CONFIG.ENERGY_THRESHOLDS[2],
  }
];
