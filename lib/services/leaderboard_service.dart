import '../models/leaderboard_entry.dart';

class LeaderboardService {
  Future<List<LeaderboardEntry>> getLeaderboard() async {
    await Future.delayed(Duration(seconds: 1));
    return [
      LeaderboardEntry(
        userId: '1',
        username: 'Alice',
        score: 150,
        avatarUrl: 'https://example.com/alice.png',
      ),
      LeaderboardEntry(
        userId: '2',
        username: 'Bob',
        score: 120,
        avatarUrl: 'https://example.com/bob.png',
      ),
    ];
  }
}