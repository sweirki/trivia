# Phase Q1 — Question Schema Standardization

## Implemented

The app now supports the new production question-bank layout:

```text
assets/data/questions/
  category/
    pack-001.json
    pack-002.json
    pack-003.json
```

The registry now loads question JSON recursively and groups all pack files by category folder.

## Final question schema

```json
{
  "id": 10001,
  "category": "cars",
  "premium": true,
  "difficulty": "easy",
  "text": "Which Japanese sports car is nicknamed Godzilla?",
  "answers": ["Nissan GT-R", "Toyota Supra", "Mazda RX-7", "Honda NSX"],
  "correctAnswer": "Nissan GT-R",
  "explanation": "The Nissan GT-R earned the nickname Godzilla because of its performance reputation.",
  "tags": ["cars", "easy", "nissan"]
}
```

## Rules

- `id` must be unique inside the category.
- `category` should match the folder name.
- `difficulty` should be `easy`, `medium`, `hard`, or `expert`.
- `answers` must have exactly 4 choices.
- `correctAnswer` must exactly match one of the 4 answers.
- `premium` is supported for monetization/category gating.
- `explanation` is optional but recommended.
- `tags` are optional but recommended for Phase Q7 diversity rules.

## Backward compatibility

The normalizer still accepts legacy fields:

```text
question -> text
options -> answers
correct -> correctAnswer
correctAnswerIndex -> correctAnswer
```

## What this phase does not do yet

Phase Q1 standardizes and loads questions correctly.

It does not yet implement:
- no-repeat memory
- weighted question selection
- session curves
- daily deterministic question pools
- tag diversity engine
- question analytics

Those belong to later Q phases.
