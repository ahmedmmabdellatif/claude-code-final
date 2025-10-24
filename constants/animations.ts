export default {
  duration: {
    fast: 150,
    normal: 300,
    page: 400,
    celebration: 800,
  },
  easing: {
    standard: [0.4, 0.0, 0.2, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
    in: [0.0, 0.0, 0.2, 1] as const,
    out: [0.4, 0.0, 1, 1] as const,
  },
};
