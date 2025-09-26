class User {
  final String id;
  final String username;
  final String email;
  final String avatarUrl;
  int score;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.avatarUrl,
    this.score = 0,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      avatarUrl: json['avatarUrl'],
      score: json['score'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'avatarUrl': avatarUrl,
      'score': score,
    };
  }
}