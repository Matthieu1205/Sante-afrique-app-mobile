/**
 * SANTÉ AFRIQUE — ArticleTypeBadge
 * Badge coloré affiché sur les articles selon leur format
 * Inspiré du badge "LE MATCH" de l'app Jeune Afrique
 */

import { Colors, FontFamily, FontSize, Radius, Spacing } from "@/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type ArticleType =
  | "grand_entretien"
  | "dossier"
  | "tribune"
  | "debat"
  | "actualite"
  | "conseil_pratique"
  | "one_health"
  | "vaccination"
  | "dossier_special";

const BADGE_CONFIG: Record<
  ArticleType,
  { label: string; bg: string; text: string }
> = {
  grand_entretien: {
    label: "GRAND ENTRETIEN",
    bg: Colors.badgeGrandEntretien,
    text: Colors.white,
  },
  dossier: {
    label: "DOSSIER",
    bg: Colors.badgeDossier,
    text: Colors.white,
  },
  tribune: {
    label: "TRIBUNE",
    bg: Colors.badgeTribune,
    text: Colors.white,
  },
  debat: {
    label: "LE DÉBAT",
    bg: Colors.badgeDebat,
    text: Colors.white,
  },
  actualite: {
    label: "ACTUALITÉ",
    bg: Colors.badgeActualite,
    text: Colors.white,
  },
  conseil_pratique: {
    label: "CONSEIL PRATIQUE",
    bg: Colors.badgeConseilPratique,
    text: Colors.white,
  },
  one_health: {
    label: "ONE HEALTH",
    bg: Colors.badgeOneHealth,
    text: Colors.white,
  },
  vaccination: {
    label: "VACCINATION",
    bg: Colors.badgeVaccination,
    text: Colors.white,
  },
  dossier_special: {
    label: "DOSSIER SPÉCIAL",
    bg: Colors.badgeDossier,
    text: Colors.white,
  },
};

interface ArticleTypeBadgeProps {
  type: ArticleType;
  compact?: boolean;
}

export const ArticleTypeBadge: React.FC<ArticleTypeBadgeProps> = ({
  type,
  compact = false,
}) => {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        compact && styles.compact,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: config.text },
          compact && styles.labelCompact,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing["2"],
    paddingVertical: 3,
    marginBottom: Spacing["1"],
  },
  compact: {
    paddingHorizontal: Spacing["1"],
    paddingVertical: 2,
  },
  label: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
  },
  labelCompact: {
    fontSize: 9,
  },
});
