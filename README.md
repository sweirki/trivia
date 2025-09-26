## Overview
This document captures the complete plan for building **Jungle Quest Trivia**, a mega trivia app with a jungle adventure theme. Players navigate a jungle path, answering trivia at stops to reach treasures, with offline adventure mode and online multiplayer battles. The app is 100% themed (change one file for look), uses unified buttons, and is built for iOS/Android using Flutter, with GitHub Codespaces for seamless home/office work.

## App Concept
- **Core Gameplay**: Players follow a jungle path with 5-10 trivia stops per level (e.g., History at "Ancient Ruins"). Answer questions to collect artifacts, unlock treasures, and progress to new biomes (Amazon → Savanna). Offline-friendly with local storage (Hive); online for head-to-head battles and leaderboards.
- **Wow Factor**: Immersive storytelling, mini-games (e.g., vine swing), customizable avatars, and user-generated trivia.
- **Theming**: All visuals (colors, fonts, assets) centralized in `lib/core/app_theme.dart`. Change colors (e.g., green to blue) in one file to retheme the app.
- **Unified Buttons**: Reusable widgets (`primary_button.dart`, `trivia_button.dart`) in `lib/widgets/buttons/` ensure consistent design/size across screens.

## Development Roadmap
- **Phase 1: MVP (3-6 months)**: Offline adventure mode, 5 levels, 1,000 questions. Basic 2D UI.
- **Phase 2: Polish & Online (2-4 months)**: Add animations, multiplayer (Firebase, Socket.io), leaderboards. Beta test with 100 users.
- **Phase 3: Launch**: Submit to App Store/Google Play. Weekly updates (new levels, events).
- **Team**: 1-2 devs, 1 designer, 1 content curator. Budget: $50K-$150K.

## Tech Stack
- **Framework**: Flutter (cross-platform iOS/Android).
- **Backend**: Firebase (auth, Firestore for questions, leaderboards), Socket.io for multiplayer.
- **Offline**: Hive for local storage (questions, progress).
- **Assets**: AI-generated (Leonardo AI, Recraft AI) for maps, icons, characters, stored in `assets/`.
- **State Management**: Provider for clean, bug-free logic.
- **Testing**: Unit/widget tests in `test/` (80%+ coverage).

## File Structure
jungle_quest_trivia/
├── lib/
│   ├── core/
│   │   ├── app_theme.dart        # Centralized theming
│   │   ├── constants.dart
│   │   ├── utils.dart
│   │   └── extensions.dart
│   ├── features/
│   │   ├── auth/                 # Login, registration
│   │   ├── gameplay/             # Jungle path, trivia stops
│   │   ├── multiplayer/          # Head-to-head, leaderboards
│   │   ├── settings/
│   │   └── onboarding/
│   ├── services/                 # API, storage, ads
│   ├── widgets/
│   │   ├── buttons/              # Unified buttons
│   │   │   ├── primary_button.dart
│   │   │   ├── secondary_button.dart
│   │   │   └── trivia_button.dart
│   └── main.dart
├── assets/                       # Images, icons, sounds, Lottie
├── test/                         # Unit/widget tests
├── pubspec.yaml
└── README.md                     # This file

## Theming Implementation
- **Single File**: `app_theme.dart` defines `ThemeData` (colors, fonts, button styles). Example:
  ```dart
  class AppTheme {
    static ThemeData get theme => ThemeData(
      primaryColor: Colors.green[800],
      buttonTheme: ButtonThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
    static const primaryGreen = Color(0xFF228B22);
    static const jungleBackground = 'assets/images/jungle_bg.png';
  }
  ```
  Usage: Wrap app in MaterialApp(theme: AppTheme.theme). Widgets use Theme.of(context) for consistency.

## Development Platform
GitHub Codespaces: Cloud-based VS Code eliminates file migration. Work from home/office via browser.
Setup:
- Log into github.com, create repo jungle_quest_trivia.
- Click "Code > Codespaces > Create codespace on main".
- Run `flutter create jungle_quest_trivia` in terminal.
- Add pubspec.yaml dependencies (Hive, Firebase, etc.), run `flutter pub get`.
- Upload AI-generated assets to assets/.
Debugging: Use VS Code’s Flutter debugger (breakpoints, hot reload).

## AI Tools for Coding
Primary: GitHub Copilot ($10/month):
- Inline autocomplete in Codespaces. Generates Flutter widgets (e.g., primary_button.dart) with 80-90% accuracy.
- Debugs via chat (e.g., “Fix Hive init error”).

Backup: Claude 3.5 Sonnet (anthropic.com, free/$20 Pro):
- Browser-based, excels at planning/debugging (e.g., “Fix offline sync logic”).
- Pair with Copilot for best results.

Grok: Used for high-level planning (this doc) and tool advice. Free via x.com, but chat-based (copy-paste needed).

## Graphics
Tools: Leonardo AI, Recraft AI for maps, icons, characters.
Example Prompt: “2D jungle map with winding paths, cartoon style, treasure icons.”
Storage: Place in assets/images/, assets/icons/, referenced in app_theme.dart.

## Monetization
Free-to-Play: Ads (Google Mobile Ads, rewarded videos), in-app purchases ($0.99-$4.99 gear packs).
Subscription: “Explorer Pass” ($4.99/month) for ad-free, exclusive levels.

## Marketing
Pre-Launch: Teasers on TikTok/YouTube, beta sign-ups.
Launch: App Store Optimization, influencer collabs.
Growth: Referrals, Discord community.

## Conversation Sync Issue
Problem: Grok history didn’t sync across devices (mobile to laptop).
Solution: Use x.com for chats (log in, find Grok in DMs). History syncs within X platform. If missing, clear browser cache or share chat via link.

## Next Steps
Await user’s “Let’s go” to start:
- Set up GitHub repo in Codespaces.
- Create Flutter project, add app_theme.dart.
- Generate assets with Leonardo AI.
- Write primary_button.dart with Copilot.
- Contact Grok on x.com for real-time guidance.

Generated from Grok conversation, September 26, 2025