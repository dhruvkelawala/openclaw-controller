// Design tokens for OpenClaw Controller
// Aesthetic: Industrial-Brutalist Cyber-Luxury

export const tokens = {
  // Core palette - high contrast dark
  colors: {
    bg: {
      primary: "#0A0A0B",
      secondary: "#121214",
      tertiary: "#1A1A1D",
      elevated: "#242428",
    },

    // Neon accents for high-stakes moments
    accent: {
      cyan: "#00F0FF",
      cyanGlow: "rgba(0, 240, 255, 0.3)",
      amber: "#FFB800",
      amberGlow: "rgba(255, 184, 0, 0.3)",
      crimson: "#FF2D55",
      crimsonGlow: "rgba(255, 45, 85, 0.3)",
      lime: "#39FF14",
      limeGlow: "rgba(57, 255, 20, 0.3)",
    },

    // Data visualization
    data: {
      positive: "#39FF14",
      negative: "#FF2D55",
      warning: "#FFB800",
      neutral: "#8B8B8F",
    },

    // Text hierarchy
    text: {
      primary: "#FFFFFF",
      secondary: "#A0A0A5",
      tertiary: "#6B6B70",
      muted: "#48484C",
    },

    // Utility
    border: {
      default: "#2A2A2E",
      highlight: "#3A3A40",
      intense: "#00F0FF",
    },
  },

  // Typography - brutalist pairing
  fonts: {
    // Bold condensed for impact
    display: "ChakraPetch-Bold",
    displayMedium: "ChakraPetch-Medium",

    // Monospace for data
    mono: "JetBrainsMono-Regular",
    monoMedium: "JetBrainsMono-Medium",
    monoBold: "JetBrainsMono-Bold",

    // Clean sans for UI
    sans: "System",
  },

  // Spacing - tight, intentional
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Radii - sharp with occasional softness
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    sharp: 2,
  },

  // Motion - snappy, mechanical
  motion: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 400,
    spring: {
      stiff: { stiffness: 400, damping: 30 },
      bounce: { stiffness: 300, damping: 10 },
    },
  },

  // Shadows - neon glows
  shadows: {
    cyan: {
      shadowColor: "#00F0FF",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    crimson: {
      shadowColor: "#FF2D55",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    subtle: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
  },
};

// Action type color mapping
export const actionColors: Record<string, { color: string; glow: string; icon: string }> = {
  swap: { color: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)", icon: "⇄" },
  transfer: { color: "#39FF14", glow: "rgba(57, 255, 20, 0.3)", icon: "→" },
  trade: { color: "#FF2D55", glow: "rgba(255, 45, 85, 0.3)", icon: "◈" },
  stake: { color: "#FFB800", glow: "rgba(255, 184, 0, 0.3)", icon: "◉" },
  unstake: { color: "#FF6B35", glow: "rgba(255, 107, 53, 0.3)", icon: "◎" },
  other: { color: "#8B8B8F", glow: "rgba(139, 139, 143, 0.3)", icon: "⋯" },
};
