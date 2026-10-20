import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/config/firebase_config.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/user_session.dart';

/// Authentication service managing JWT token lifecycle, backend login,
/// Firebase email verification flow, and session state.
class AuthService extends ChangeNotifier {
  final ApiClient _apiClient;
  static const String userKey = 'cinephile_user_data';

  UserSession? _currentUser;
  bool _isLoading = false;
  bool _initialized = false;

  AuthService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  UserSession? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null && _currentUser!.token.isNotEmpty;
  bool get isLoading => _isLoading;
  bool get isInitialized => _initialized;

  /// Check persisted session on app startup
  Future<void> initSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _apiClient.getToken();
      if (token != null && token.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        final userRaw = prefs.getString(userKey);
        if (userRaw != null) {
          final userJson = jsonDecode(userRaw) as Map<String, dynamic>;
          _currentUser = UserSession.fromJson(userJson);
        }
      }
    } catch (e) {
      debugPrint('Error restoring user session: $e');
      await logout();
    } finally {
      _isLoading = false;
      _initialized = true;
      notifyListeners();
    }
  }

  /// Log in with email or username and password
  Future<UserSession> login(String identifier, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiEndpoints.authLogin,
        body: {
          'emailaddress': identifier.trim(),
          'password': password,
        },
      );

      if (response is Map<String, dynamic>) {
        final session = UserSession.fromLoginJson(response);
        await _saveSession(session);
        _currentUser = session;
        return session;
      }
      throw Exception('Invalid server response format.');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Step 1 of registration: Create Firebase account and send verification email
  /// Uses the Firebase REST API directly so no server-side secrets or native plugins are needed.
  Future<String> sendFirebaseVerificationEmail(String email, String password) async {
    try {
      // 1. Sign up on Firebase Auth
      final signUpResponse = await http.post(
        Uri.parse(FirebaseConfig.signUpUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email.trim(),
          'password': password,
          'returnSecureToken': true,
        }),
      );

      final signUpData = jsonDecode(signUpResponse.body);
      if (signUpResponse.statusCode != 200) {
        final errorMsg = signUpData['error']?['message'] ?? 'Firebase signup failed';
        if (errorMsg.toString().contains('EMAIL_EXISTS')) {
          // If already created in Firebase, attempt sign-in to resend verification
          return await _resendFirebaseVerification(email, password);
        }
        throw Exception(errorMsg);
      }

      final idToken = signUpData['idToken'] as String;

      // 2. Send verification email
      await _sendOobVerificationCode(idToken);
      return idToken;
    } catch (e) {
      debugPrint('Firebase registration error: $e');
      rethrow;
    }
  }

  /// Step 2 of registration: Verify that the user has verified email and retrieve current ID token
  Future<String> checkFirebaseEmailVerified(String email, String password) async {
    // Sign in to refresh token and check emailVerified flag
    final signInResponse = await http.post(
      Uri.parse(FirebaseConfig.signInWithPasswordUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
        'returnSecureToken': true,
      }),
    );

    final signInData = jsonDecode(signInResponse.body);
    if (signInResponse.statusCode != 200) {
      throw Exception(signInData['error']?['message'] ?? 'Authentication failed');
    }

    final idToken = signInData['idToken'] as String;

    // Lookup account details to verify email status
    final lookupResponse = await http.post(
      Uri.parse(FirebaseConfig.accountLookupUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idToken': idToken}),
    );

    final lookupData = jsonDecode(lookupResponse.body);
    final users = lookupData['users'] as List?;
    if (users != null && users.isNotEmpty) {
      final emailVerified = users[0]['emailVerified'] as bool? ?? false;
      if (!emailVerified) {
        throw Exception('Email has not been verified yet. Please check your inbox.');
      }
    }

    return idToken;
  }

  /// Step 3 of registration: Submit verified token to Spring Boot backend
  Future<String> verifyEmailAndCreateAccount({
    required String firstname,
    required String lastname,
    required String emailaddress,
    required String password,
    required String confirmPassword,
    required String firebaseIdToken,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiEndpoints.authVerifyEmail,
        body: {
          'firstname': firstname.trim(),
          'lastname': lastname.trim(),
          'emailaddress': emailaddress.trim(),
          'password': password,
          'confirmPassword': confirmPassword,
          'firebaseIdToken': firebaseIdToken,
        },
      );

      return response is String ? response : 'Account created successfully';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String> _resendFirebaseVerification(String email, String password) async {
    final signInResponse = await http.post(
      Uri.parse(FirebaseConfig.signInWithPasswordUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
        'returnSecureToken': true,
      }),
    );

    final signInData = jsonDecode(signInResponse.body);
    if (signInResponse.statusCode != 200) {
      throw Exception('An account with this email already exists.');
    }

    final idToken = signInData['idToken'] as String;
    await _sendOobVerificationCode(idToken);
    return idToken;
  }

  Future<void> _sendOobVerificationCode(String idToken) async {
    final response = await http.post(
      Uri.parse(FirebaseConfig.sendEmailVerificationUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'requestType': 'VERIFY_EMAIL',
        'idToken': idToken,
      }),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['error']?['message'] ?? 'Failed to send verification email');
    }
  }

  /// Clear session and log out
  Future<void> logout() async {
    await _apiClient.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(userKey);
    _currentUser = null;
    notifyListeners();
  }

  Future<void> _saveSession(UserSession session) async {
    await _apiClient.saveToken(session.token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(userKey, jsonEncode(session.toJson()));
  }
}
