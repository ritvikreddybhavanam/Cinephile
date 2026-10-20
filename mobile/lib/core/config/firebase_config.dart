/// Firebase client configuration matching the Cinephile web frontend (`film-buff-5c467`).
/// Notice: Only public client identifiers are stored here. No service account keys,
/// private keys, or server secrets exist in the mobile application.
class FirebaseConfig {
  FirebaseConfig._();

  static const String apiKey = 'AIzaSyDM9HeRo_wPGC1Tka6TNfz4pPEZfsl6d_E';
  static const String authDomain = 'film-buff-5c467.firebaseapp.com';
  static const String projectId = 'film-buff-5c467';
  static const String storageBucket = 'film-buff-5c467.firebasestorage.app';
  static const String messagingSenderId = '322356197049';
  static const String appId = '1:322356197049:web:444a52718a03a51c56cd68';

  /// Firebase Auth REST API Base URLs for cross-platform email verification
  static const String authRestBase = 'https://identitytoolkit.googleapis.com/v1';

  static String get signUpUrl =>
      '$authRestBase/accounts:signUp?key=$apiKey';

  static String get signInWithPasswordUrl =>
      '$authRestBase/accounts:signInWithPassword?key=$apiKey';

  static String get sendEmailVerificationUrl =>
      '$authRestBase/accounts:sendOobCode?key=$apiKey';

  static String get accountLookupUrl =>
      '$authRestBase/accounts:lookup?key=$apiKey';
}
