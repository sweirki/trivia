class AuthService {
  // Simulates authentication logic
  Future<String?> login(String username, String password) async {
    await Future.delayed(Duration(seconds: 1));
    if (username == 'demo' && password == 'password') {
      return 'user-id-demo';
    }
    return null;
  }

  Future<void> logout() async {
    await Future.delayed(Duration(milliseconds: 500));
  }
}