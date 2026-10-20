/// Holds authenticated user session details and JWT token.
class UserSession {
  final int id;
  final String email;
  final String firstname;
  final String lastname;
  final String? username;
  final String token;

  const UserSession({
    required this.id,
    required this.email,
    required this.firstname,
    required this.lastname,
    this.username,
    required this.token,
  });

  factory UserSession.fromLoginJson(Map<String, dynamic> json) {
    return UserSession(
      id: (json['id'] as num?)?.toInt() ?? 0,
      email: json['emailaddress'] as String? ?? json['email'] as String? ?? '',
      firstname: json['firstname'] as String? ?? '',
      lastname: json['lastname'] as String? ?? '',
      username: json['username'] as String?,
      token: json['token'] as String? ?? '',
    );
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      id: (json['id'] as num?)?.toInt() ?? 0,
      email: json['email'] as String? ?? json['emailaddress'] as String? ?? '',
      firstname: json['firstname'] as String? ?? '',
      lastname: json['lastname'] as String? ?? '',
      username: json['username'] as String?,
      token: json['token'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'firstname': firstname,
        'lastname': lastname,
        'username': username,
        'token': token,
      };

  String get displayName =>
      '$firstname $lastname'.trim().isNotEmpty ? '$firstname $lastname'.trim() : email;
}
