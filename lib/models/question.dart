class Question {
  final String id;
  final String text;
  final List<String> options;
  final int correctOptionIndex;
  final String? imageUrl;

  Question({
    required this.id,
    required this.text,
    required this.options,
    required this.correctOptionIndex,
    this.imageUrl,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      text: json['text'],
      options: List<String>.from(json['options']),
      correctOptionIndex: json['correctOptionIndex'],
      imageUrl: json['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'options': options,
      'correctOptionIndex': correctOptionIndex,
      'imageUrl': imageUrl,
    };
  }
}