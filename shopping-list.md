# 🛒 Trivia App Shopping List

Tracks every asset required for the trivia app, including AI-ready prompts for Leonardo.ai and Recraft.ai to generate themed, matching graphics.

---

## 🎨 Graphics (Leonardo.ai / Recraft.ai)

| Asset         | Filename        | Folder             | Description for AI Prompt |
|---------------|-----------------|--------------------|----------------------------|
| App Icon      | icon.png        | assets/graphics/   | "Minimalist trivia app icon with a question mark inside a glowing circle, vibrant gradient background, modern flat style" |
| Background    | bg_main.jpg     | assets/graphics/   | "Dynamic trivia background with abstract shapes, soft lighting, and subtle texture, optimized for readability and energy" |
| Button Style  | btn_primary.png | assets/graphics/   | "Rounded button with glossy finish, bold text, slight shadow, themed to match trivia excitement and urgency" |
| Trophy Icon   | trophy.png      | assets/graphics/   | "Golden trophy with sparkles and ribbon, cartoon style, used to celebrate tournament winners" |
| Coin Icon     | coin.png        | assets/graphics/   | "Gold coin with embossed star, shiny edges, playful and game-like, used for in-app currency" |
| AI Avatar     | avatar.png      | assets/graphics/   | "Friendly robot avatar with glowing eyes and headset, futuristic but cute, represents AI question generator" |

---

## 🔊 Audio

| Asset         | Filename     | Folder           | Description                        |
|---------------|--------------|------------------|------------------------------------|
| Correct Answer| correct.mp3  | assets/audio/    | Sound when player answers correctly |
| Wrong Answer  | wrong.mp3    | assets/audio/    | Sound when player answers incorrectly |
| Win Jingle    | win.mp3      | assets/audio/    | Played when player wins tournament |
| Button Click  | click.mp3    | assets/audio/    | UI interaction sound |

---

## 🎭 Theme Control

| Asset         | Filename         | Folder           | Description                        |
|---------------|------------------|------------------|------------------------------------|
| Theme Config  | theme.json       | src/theme/       | Controls colors, fonts, layout     |
| Theme Switcher| ThemeProvider.tsx| src/context/     | Dynamically applies theme settings |

---

## 🧠 AI Components

| Asset              | Filename           | Folder           | Description                        |
|--------------------|--------------------|------------------|------------------------------------|
| AI Pack Generator  | GeneratePack.tsx   | src/screens/     | Generates trivia packs instantly   |
| AI Question Builder| questionAI.ts      | src/utils/       | (Planned) Custom AI for trivia     |

---

## 🏪 Store & Monetization

| Asset         | Filename         | Folder           | Description                        |
|---------------|------------------|------------------|------------------------------------|
| Coin Store UI | CoinStore.tsx    | src/screens/     | UI for buying coins                |
| Booster Shop  | BoosterShop.tsx  | src/screens/     | UI for power-ups                   |
| Stripe Config | stripeConfig.ts  | src/utils/       | Payment integration                |
| Expo IAP Setup| iapSetup.ts      | src/utils/       | In-app purchase logic              |

---

## 📦 Trivia Packs

| Asset         | Filename         | Folder               | Description                        |
|---------------|------------------|----------------------|------------------------------------|
| Sports Pack   | sports.json      | src/data/packs/      | Sample trivia pack                 |
| AI Pack       | ai_pack_001.json | src/data/packs/      | Auto-generated pack                |
| User Packs    | user_*.json      | src/data/packs/      | Created by players                 |

---

## 🧩 Multiplayer & Sync (Upcoming)

| Asset         | Filename         | Folder           | Description                        |
|---------------|------------------|------------------|------------------------------------|
| Match Store   | matchStore.tsx   | src/context/     | Multiplayer match logic            |
| Sync Engine   | syncEngine.ts    | src/utils/       | Real-time sync logic (planned)     |