# Phase Q6 Question System Check

Confirmed present in this app build:

- Q1 schema standardization
- Q2 central registry
- Q3 curated session builder
- Q4 recent question memory
- Q5 weighted question selection
- Q6 adaptive difficulty

## Expected behavior

Quick Play now gradually adjusts its preferred difficulty based on recent answer performance:

- new/low-confidence players start on easy
- strong recent performance moves toward medium/hard
- weak recent performance softens difficulty
- ranked/daily/tournament modes stay stable and fair

## Manual test

1. Start Quick Play.
2. Answer many questions correctly.
3. Start a new Quick Play session.
4. The session should lean harder over time.
5. Answer many questions incorrectly.
6. The session should soften over time.
