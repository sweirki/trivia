# Android / EAS / Google Play versionCode fix

This project archive does not include a native `android/` folder, so Android Play upload versioning is controlled by Expo config plus EAS settings.

## What changed

- `app.config.js`
  - `version` changed from `1.0.0` to `1.1.0`
  - `android.versionCode` changed from `3` to `10`
  - `ios.buildNumber` changed from `3` to `10`
- `eas.json`
  - `cli.appVersionSource` changed from `remote` to `local`
  - production `autoIncrement` changed to `false`
- Added `.easignore` to keep stale backups/zips/node_modules out of EAS uploads.

## Why

The previous config had:

```json
"appVersionSource": "remote"
```

With remote app version source, EAS can use its remote Android version state instead of the local `android.versionCode` in `app.config.js`. That explains how Play Console could still receive an AAB with versionCode `2` even while local config showed `3`.

Using local app version source makes the next production AAB use `android.versionCode: 10` from `app.config.js`.

## Next safe commands

```bash
npm run typecheck
npm run lint
npm test
npm run release:check
eas build --platform android --profile production --clear-cache
```

Upload only the newly produced AAB from this build. Do not re-upload an older AAB from a previous EAS build.

## If you prefer EAS remote versioning instead

Keep `appVersionSource: "remote"`, but explicitly set the remote Android version to a value greater than any version already uploaded to Play Console:

```bash
eas build:version:set --platform android
```

Set it to at least `10`, then run a fresh production build.
