/// Represents the full user profile including social metrics and cinema stats.
class UserProfile {
  final int id;
  final String firstname;
  final String lastname;
  final String email;
  final String? username;
  final String? bio;
  final String? avatarUrl;
  final String? location;
  final String? website;
  final List<String> favoriteGenres;
  final int followersCount;
  final int followingCount;
  final int watchedCount;
  final int reviewsCount;
  final int watchlistCount;
  final int totalHoursWatched;
  final DateTime? memberSince;

  const UserProfile({
    required this.id,
    required this.firstname,
    required this.lastname,
    required this.email,
    this.username,
    this.bio,
    this.avatarUrl,
    this.location,
    this.website,
    this.favoriteGenres = const [],
    this.followersCount = 0,
    this.followingCount = 0,
    this.watchedCount = 0,
    this.reviewsCount = 0,
    this.watchlistCount = 0,
    this.totalHoursWatched = 0,
    this.memberSince,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    List<String> genres = [];
    if (json['favoriteGenres'] is List) {
      genres = (json['favoriteGenres'] as List).map((e) => e.toString()).toList();
    } else if (json['favoriteGenres'] is String && (json['favoriteGenres'] as String).isNotEmpty) {
      genres = (json['favoriteGenres'] as String).split(',').map((s) => s.trim()).toList();
    }

    DateTime? joinedDate;
    if (json['memberSince'] != null || json['createdAt'] != null) {
      try {
        joinedDate = DateTime.parse((json['memberSince'] ?? json['createdAt']).toString());
      } catch (_) {}
    }

    return UserProfile(
      id: (json['id'] as num?)?.toInt() ?? 0,
      firstname: json['firstname'] as String? ?? '',
      lastname: json['lastname'] as String? ?? '',
      email: json['emailaddress'] as String? ?? json['email'] as String? ?? '',
      username: json['username'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      location: json['location'] as String?,
      website: json['website'] as String?,
      favoriteGenres: genres,
      followersCount: (json['followersCount'] as num?)?.toInt() ?? 0,
      followingCount: (json['followingCount'] as num?)?.toInt() ?? 0,
      watchedCount: (json['watchedCount'] as num?)?.toInt() ?? 0,
      reviewsCount: (json['reviewsCount'] as num?)?.toInt() ?? 0,
      watchlistCount: (json['watchlistCount'] as num?)?.toInt() ?? 0,
      totalHoursWatched: (json['totalHoursWatched'] as num?)?.toInt() ?? 0,
      memberSince: joinedDate,
    );
  }

  String get displayName {
    if (username != null && username!.isNotEmpty) return '@$username';
    final full = '$firstname $lastname'.trim();
    return full.isNotEmpty ? full : email;
  }
}
