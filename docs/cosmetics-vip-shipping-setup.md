# Cosmetics + VIP Shipping Setup

This package prepares the app to receive final professional cosmetic assets without changing filenames later.

## What is ready

- Catalog entries for avatars, frames, profile backgrounds, badges, arena banners, answer trails, streak auras, and VIP visuals.
- Static Expo-safe asset registry in `src/cosmetics/cosmeticAssets.ts`.
- Placeholder PNGs for every final asset slot.
- Recraft prompt pack for producing every final asset.
- VIP-only cosmetics are marked with `vipOnly: true` and `unlockType: "VIP"`.

## How to use

1. Generate the final asset in Recraft using `docs/triviaworld_recraft_final_asset_prompts.md`.
2. Export as PNG at the listed size.
3. Replace the matching placeholder file in `assets/cosmetics/...`.
4. Keep the exact filename.
5. Run:

```bash
npm run typecheck
npm run lint
npm test
```

## Important

Cosmetics are visual only. Do not add gameplay power, win-rate boosts, answer advantages, or pay-to-win effects.
