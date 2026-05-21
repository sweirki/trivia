// src/cosmetics/cosmeticAssets.ts
import type { ImageSourcePropType } from "react-native";

export type CosmeticAssetKey = string;

export const COSMETIC_ASSETS: Record<string, ImageSourcePropType> = {
  "answer_trail_blue_comet_01": require("../../assets/cosmetics/trails/answer_trail_blue_comet_01.webp"),
  "answer_trail_cosmic_vip_01": require("../../assets/cosmetics/trails/answer_trail_cosmic_vip_01.webp"),
  "answer_trail_gold_spark_01": require("../../assets/cosmetics/trails/answer_trail_gold_spark_01.webp"),
  "answer_trail_green_check_01": require("../../assets/cosmetics/trails/answer_trail_green_check_01.webp"),
  "answer_trail_neon_lightning_01": require("../../assets/cosmetics/trails/answer_trail_neon_lightning_01.webp"),
  "answer_trail_vip_crown_01": require("../../assets/cosmetics/trails/answer_trail_vip_crown_01.webp"),
  "arena_banner_galaxy_final_01": require("../../assets/cosmetics/arena-banners/arena_banner_galaxy_final_01.webp"),
  "arena_banner_neon_champion_01": require("../../assets/cosmetics/arena-banners/arena_banner_neon_champion_01.webp"),
  "arena_banner_royal_vip_01": require("../../assets/cosmetics/arena-banners/arena_banner_royal_vip_01.webp"),
  "arena_banner_stadium_lights_01": require("../../assets/cosmetics/arena-banners/arena_banner_stadium_lights_01.webp"),
  "arena_banner_vip_gold_01": require("../../assets/cosmetics/arena-banners/arena_banner_vip_gold_01.webp"),
  "avatar_blue_01": require("../../assets/cosmetics/avatars/avatar_blue_01.webp"),
  "avatar_galaxy_ace_01": require("../../assets/cosmetics/avatars/avatar_galaxy_ace_01.webp"),
  "avatar_mint_01": require("../../assets/cosmetics/avatars/avatar_mint_01.webp"),
  "avatar_mystic_owl_01": require("../../assets/cosmetics/avatars/avatar_mystic_owl_01.webp"),
  "avatar_neon_brain_01": require("../../assets/cosmetics/avatars/avatar_neon_brain_01.webp"),
  "avatar_quiz_master_01": require("../../assets/cosmetics/avatars/avatar_quiz_master_01.webp"),
  "avatar_robot_genius_01": require("../../assets/cosmetics/avatars/avatar_robot_genius_01.webp"),
  "avatar_sunrise_01": require("../../assets/cosmetics/avatars/avatar_sunrise_01.webp"),
  "avatar_vip_crown_01": require("../../assets/cosmetics/avatars/avatar_vip_crown_01.webp"),
  "badge_arena_champion_01": require("../../assets/cosmetics/badges/badge_arena_champion_01.webp"),
  "badge_brainiac_01": require("../../assets/cosmetics/badges/badge_brainiac_01.webp"),
  "badge_daily_grinder_01": require("../../assets/cosmetics/badges/badge_daily_grinder_01.webp"),
  "badge_founder_legend": require("../../assets/cosmetics/badges/badge_founder_legend.webp"),
  "badge_perfect_score_01": require("../../assets/cosmetics/badges/badge_perfect_score_01.webp"),
  "badge_speed_round_01": require("../../assets/cosmetics/badges/badge_speed_round_01.webp"),
  "badge_starter_01": require("../../assets/cosmetics/badges/badge_starter_01.webp"),
  "badge_tournament_king_01": require("../../assets/cosmetics/badges/badge_tournament_king_01.webp"),
  "badge_vip_crown_01": require("../../assets/cosmetics/badges/badge_vip_crown_01.webp"),
  "bg_arcade_grid_01": require("../../assets/cosmetics/backgrounds/bg_arcade_grid_01.webp"),
  "bg_cyber_stage_01": require("../../assets/cosmetics/backgrounds/bg_cyber_stage_01.webp"),
  "bg_legend_nebula_01": require("../../assets/cosmetics/backgrounds/bg_legend_nebula_01.webp"),
  "bg_library_glow_01": require("../../assets/cosmetics/backgrounds/bg_library_glow_01.webp"),
  "bg_night_01": require("../../assets/cosmetics/backgrounds/bg_night_01.webp"),
  "bg_stadium_lights_01": require("../../assets/cosmetics/backgrounds/bg_stadium_lights_01.webp"),
  "bg_trophy_hall_01": require("../../assets/cosmetics/backgrounds/bg_trophy_hall_01.webp"),
  "bg_vip_lounge_01": require("../../assets/cosmetics/backgrounds/bg_vip_lounge_01.webp"),
  "frame_cosmic_pulse_01": require("../../assets/cosmetics/frames/frame_cosmic_pulse_01.webp"),
  "frame_diamond_vip_01": require("../../assets/cosmetics/frames/frame_diamond_vip_01.webp"),
  "frame_emerald_streak_01": require("../../assets/cosmetics/frames/frame_emerald_streak_01.webp"),
  "frame_fire_streak_01": require("../../assets/cosmetics/frames/frame_fire_streak_01.webp"),
  "frame_gold_01": require("../../assets/cosmetics/frames/frame_gold_01.webp"),
  "frame_neon_blue_01": require("../../assets/cosmetics/frames/frame_neon_blue_01.webp"),
  "frame_royal_legend_01": require("../../assets/cosmetics/frames/frame_royal_legend_01.webp"),
  "frame_silver_clean_01": require("../../assets/cosmetics/frames/frame_silver_clean_01.webp"),
  "streak_aura_blue_flame_01": require("../../assets/cosmetics/streaks/streak_aura_blue_flame_01.webp"),
  "streak_aura_diamond_vip_01": require("../../assets/cosmetics/streaks/streak_aura_diamond_vip_01.webp"),
  "streak_aura_fire_7_01": require("../../assets/cosmetics/streaks/streak_aura_fire_7_01.webp"),
  "streak_aura_legend_sun_01": require("../../assets/cosmetics/streaks/streak_aura_legend_sun_01.webp"),
  "streak_aura_neon_pulse_01": require("../../assets/cosmetics/streaks/streak_aura_neon_pulse_01.webp"),
  "streak_aura_royal_vip_01": require("../../assets/cosmetics/streaks/streak_aura_royal_vip_01.webp"),
};

export const COSMETIC_UI_ASSETS: Record<string, ImageSourcePropType> = {
  "vip_crown_badge_01": require("../../assets/cosmetics/system/vip_crown_badge_01.webp"),
  "locked_cosmetic_placeholder": require("../../assets/cosmetics/system/locked_cosmetic_placeholder.webp"),
  "empty_avatar_placeholder": require("../../assets/cosmetics/system/empty_avatar_placeholder.webp"),
  "store_cosmetics_hero_01": require("../../assets/cosmetics/system/store_cosmetics_hero_01.webp"),
  "vip_store_hero_01": require("../../assets/cosmetics/system/vip_store_hero_01.webp"),
};

export function getCosmeticAssetSource(key?: string | null): ImageSourcePropType | null {
  if (!key) return null;
  return COSMETIC_ASSETS[key] ?? COSMETIC_UI_ASSETS[key] ?? null;
}
