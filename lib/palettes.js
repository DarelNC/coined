// Color palettes for the Maximalist theme. Each slot (background,
// foreground, muted, accent, pop-1..4) is what globals.css defines by
// default — a palette here just overrides those CSS custom properties
// inline on the theme's root element, so every existing Tailwind class
// (bg-background, bg-accent, bg-pop-1, ...) repaints automatically.
export const PALETTES = {
  grape: {
    label: "Grape",
    swatch: "#ffd23f",
    vars: {
      "--background": "#2b1a33",
      "--foreground": "#fdf6e3",
      "--muted": "#b3a3ba",
      "--accent": "#ffd23f",
      "--pop-1": "#ff6ec7",
      "--pop-2": "#4ecdc4",
      "--pop-3": "#c6f24e",
      "--pop-4": "#ff8c42",
    },
  },
  sunset: {
    label: "Sunset",
    swatch: "#ef476f",
    vars: {
      "--background": "#3d1523",
      "--foreground": "#fff3e6",
      "--muted": "#d9a9a0",
      "--accent": "#ffb703",
      "--pop-1": "#ef476f",
      "--pop-2": "#06d6a0",
      "--pop-3": "#ffd60a",
      "--pop-4": "#f77f00",
    },
  },
  forest: {
    label: "Forest",
    swatch: "#e07a5f",
    vars: {
      "--background": "#16261e",
      "--foreground": "#f1f7ed",
      "--muted": "#9db8a4",
      "--accent": "#f2c14e",
      "--pop-1": "#e07a5f",
      "--pop-2": "#81b29a",
      "--pop-3": "#f4f1bb",
      "--pop-4": "#e63946",
    },
  },
  midnight: {
    label: "Midnight",
    swatch: "#38f9d7",
    vars: {
      "--background": "#14141f",
      "--foreground": "#f5f5f7",
      "--muted": "#8888a0",
      "--accent": "#ffd23f",
      "--pop-1": "#ff5ca8",
      "--pop-2": "#38f9d7",
      "--pop-3": "#c3f73a",
      "--pop-4": "#ff8552",
    },
  },
};

export const DEFAULT_PALETTE = "grape";
