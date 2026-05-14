# Store gems/VIP UI fix

Changed:
- Gem packs now grant/display exact RevenueCat/Google Play product amounts:
  - `gems_100` -> 100 gems
  - `gems_250` -> 250 gems
  - `gems_700` -> 700 gems
  - `gems_1500` -> 1500 gems
- Removed local bonus amounts from the gem calculation so the UI and purchase grant do not show/add 275, 840, or 2100 unless those are intentionally configured later.
- Added safer header spacing/z-index/elevation and explicit row gaps so the VIP badge does not get covered by the tab bar when the balance row wraps.

Files changed:
- `src/config/storeConfig.ts`
- `app/(app)/store/index.tsx`
