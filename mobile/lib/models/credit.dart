import '../core/config/env.dart';

/// Represents a cast member in a film.
class CastMember {
  final int id;
  final String name;
  final String character;
  final String? profilePath;
  final int? order;

  const CastMember({
    required this.id,
    required this.name,
    required this.character,
    this.profilePath,
    this.order,
  });

  factory CastMember.fromJson(Map<String, dynamic> json) {
    return CastMember(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? 'Unknown',
      character: json['character'] as String? ?? '',
      profilePath: json['profile_path'] as String?,
      order: (json['order'] as num?)?.toInt(),
    );
  }

  String? get profileUrl => Env.profileUrl(profilePath);
}

/// Represents a crew member (Director, Writer, Cinematographer, etc.).
class CrewMember {
  final int id;
  final String name;
  final String job;
  final String department;
  final String? profilePath;

  const CrewMember({
    required this.id,
    required this.name,
    required this.job,
    required this.department,
    this.profilePath,
  });

  factory CrewMember.fromJson(Map<String, dynamic> json) {
    return CrewMember(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? 'Unknown',
      job: json['job'] as String? ?? '',
      department: json['department'] as String? ?? '',
      profilePath: json['profile_path'] as String?,
    );
  }

  String? get profileUrl => Env.profileUrl(profilePath);
}

/// Container for both Cast and Crew credits.
class MovieCredits {
  final List<CastMember> cast;
  final List<CrewMember> crew;

  const MovieCredits({this.cast = const [], this.crew = const []});

  factory MovieCredits.fromJson(Map<String, dynamic> json) {
    final rawCast = json['cast'] as List? ?? [];
    final rawCrew = json['crew'] as List? ?? [];

    return MovieCredits(
      cast: rawCast
          .whereType<Map<String, dynamic>>()
          .map((c) => CastMember.fromJson(c))
          .toList(),
      crew: rawCrew
          .whereType<Map<String, dynamic>>()
          .map((c) => CrewMember.fromJson(c))
          .toList(),
    );
  }

  /// Get the lead director name if present
  String? get directorName {
    final director = crew.firstWhere(
      (c) => c.job.toLowerCase() == 'director',
      orElse: () => const CrewMember(id: 0, name: '', job: '', department: ''),
    );
    return director.name.isNotEmpty ? director.name : null;
  }
}
