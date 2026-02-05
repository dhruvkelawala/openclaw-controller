import { tokens } from "./design-tokens";

// Dynamic styles based on action type
export const getActionStyles = (action: string) => {
  const config = {
    swap: { color: "#00F0FF", bg: "rgba(0, 240, 255, 0.1)" },
    transfer: { color: "#39FF14", bg: "rgba(57, 255, 20, 0.1)" },
    trade: { color: "#FF2D55", bg: "rgba(255, 45, 85, 0.1)" },
    stake: { color: "#FFB800", bg: "rgba(255, 184, 0, 0.1)" },
    unstake: { color: "#FF6B35", bg: "rgba(255, 107, 53, 0.1)" },
    other: { color: "#8B8B8F", bg: "rgba(139, 139, 143, 0.1)" },
  }[action] || { color: "#8B8B8F", bg: "rgba(139, 139, 143, 0.1)" };

  return {
    badge: {
      backgroundColor: config.bg,
      borderColor: config.color,
      borderWidth: 1,
      borderRadius: 2,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeText: {
      color: config.color,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase" as const,
    },
    icon: {
      color: config.color,
    },
  };
};

// Re-export tokens for convenience
export { tokens };
