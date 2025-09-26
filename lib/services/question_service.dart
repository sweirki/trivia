import '../models/question.dart';

class QuestionService {
  Future<List<Question>> fetchQuestions() async {
    await Future.delayed(Duration(seconds: 1));
    return [
      Question(
        id: 'q1',
        text: 'What is the capital of France?',
        options: ['Paris', 'Berlin', 'Rome', 'Madrid'],
        correctOptionIndex: 0,
      ),
      Question(
        id: 'q2',
        text: 'Who wrote "Hamlet"?',
        options: ['Shakespeare', 'Dickens', 'Austen', 'Orwell'],
        correctOptionIndex: 0,
      ),
    ];
  }
}