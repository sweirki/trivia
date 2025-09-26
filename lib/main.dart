// Main entry point for the Flutter Trivia App

import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Trivia App',
      theme: appTheme,
      home: OnboardingScreen(),
    );
  }
}
