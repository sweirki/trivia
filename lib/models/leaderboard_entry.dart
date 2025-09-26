class LeaderboardEntry {
  final String userId;
  final String username;
  final int score;
  final String avatarUrl;

  LeaderboardEntry({
    required this.userId,
    required this.username,
    required this.score,
    required this.avatarUrl,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      userId: json['userId'],
      username: json['username'],
      score: json['score'],
      avatarUrl: json['avatarUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'score': score,
      'avatarUrl': avatarUrl,
    };
  }
}