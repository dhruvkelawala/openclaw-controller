import { StyleSheet } from "react-native";
import { tokens } from "./design-tokens";

// Industrial-Brutalist Cyber-Luxury Style System
export const styles = StyleSheet.create({
  // Layout containers
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },

  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
    paddingHorizontal: tokens.space.lg,
  },

  // Typography - brutalist hierarchy
  titleMega: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
    color: tokens.colors.text.primary,
    textTransform: "uppercase",
  },

  titleLarge: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    color: tokens.colors.text.primary,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: tokens.colors.text.primary,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    color: tokens.colors.text.secondary,
    textTransform: "uppercase",
  },

  body: {
    fontSize: 16,
    fontWeight: "400",
    color: tokens.colors.text.secondary,
    lineHeight: 24,
  },

  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    color: tokens.colors.text.tertiary,
    lineHeight: 20,
  },

  // Monospace for data
  monoLarge: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
    color: tokens.colors.text.primary,
    fontVariant: ["tabular-nums"],
  },

  mono: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: tokens.colors.text.primary,
    fontVariant: ["tabular-nums"],
  },

  monoSmall: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: tokens.colors.text.tertiary,
    fontVariant: ["tabular-nums"],
  },

  // Cards - brutalist with sharp edges
  card: {
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: tokens.radius.sharp,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
  },

  cardElevated: {
    backgroundColor: tokens.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: tokens.colors.border.highlight,
    borderRadius: tokens.radius.sharp,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
  },

  cardGlow: {
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.accent.cyan,
    borderRadius: tokens.radius.sharp,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
    shadowColor: tokens.colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  // Buttons - industrial, mechanical
  buttonPrimary: {
    backgroundColor: tokens.colors.accent.cyan,
    borderRadius: tokens.radius.none,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPrimaryText: {
    color: tokens.colors.bg.primary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: tokens.colors.border.highlight,
    borderRadius: tokens.radius.none,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonSecondaryText: {
    color: tokens.colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  buttonDanger: {
    backgroundColor: tokens.colors.accent.crimson,
    borderRadius: tokens.radius.none,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDangerText: {
    color: tokens.colors.text.primary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Status indicators
  statusPending: {
    backgroundColor: tokens.colors.accent.amberGlow,
    borderWidth: 1,
    borderColor: tokens.colors.accent.amber,
    borderRadius: tokens.radius.none,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
  },

  statusApproved: {
    backgroundColor: tokens.colors.accent.limeGlow,
    borderWidth: 1,
    borderColor: tokens.colors.accent.lime,
    borderRadius: tokens.radius.none,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
  },

  statusRejected: {
    backgroundColor: tokens.colors.accent.crimsonGlow,
    borderWidth: 1,
    borderColor: tokens.colors.accent.crimson,
    borderRadius: tokens.radius.none,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
  },

  // Utility
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.default,
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.default,
  },

  divider: {
    height: 1,
    backgroundColor: tokens.colors.border.default,
    marginVertical: tokens.space.md,
  },

  // Action type badges
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
    borderRadius: tokens.radius.none,
    borderWidth: 1,
  },

  // Header styles
  header: {
    paddingTop: tokens.space.xxl,
    paddingBottom: tokens.space.lg,
    paddingHorizontal: tokens.space.lg,
    backgroundColor: tokens.colors.bg.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.default,
  },

  // Grid layouts
  statsGrid: {
    flexDirection: "row",
    gap: tokens.space.md,
    marginBottom: tokens.space.lg,
  },

  statBox: {
    flex: 1,
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: tokens.radius.sharp,
    padding: tokens.space.md,
  },
});

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
      textTransform: "uppercase",
    },
    icon: {
      color: config.color,
    },
  };
};
