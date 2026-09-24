service ChatService {
  action chat(message: String, history: LargeString) returns LargeString;
}