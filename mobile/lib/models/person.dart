import '../core/config/env.dart';
import 'movie.dart';

/// Represents a director, actor, or crew member from TMDB.
class Person {
  final int id;
  final String name;
  final String? biography;
  final String? profilePath;
  final String? birthday;
  final String? placeOfBirth;
  final String? knownForDepartment;
  final double? popularity;
  final List<Movie> knownFor;

  const Person({
    required this.id,
    required this.name,
    this.biography,
    this.profilePath,
    this.birthday,
    this.placeOfBirth,
    this.knownForDepartment,
    this.popularity,
    this.knownFor = const [],
  });

  factory Person.fromJson(Map<String, dynamic> json) {
    List<Movie> credits = [];
    if (json['known_for'] is List) {
      credits = (json['known_for'] as List)
          .whereType<Map<String, dynamic>>()
          .map((m) => Movie.fromJson(m))
          .toList();
    } else if (json['combined_credits'] is Map && json['combined_credits']['cast'] is List) {
      credits = (json['combined_credits']['cast'] as List)
          .whereType<Map<String, dynamic>>()
          .map((m) => Movie.fromJson(m))
          .toList();
    }

    return Person(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? 'Unknown Artist',
      biography: json['biography'] as String?,
      profilePath: json['profile_path'] as String?,
      birthday: json['birthday'] as String?,
      placeOfBirth: json['place_of_birth'] as String?,
      knownForDepartment: json['known_for_department'] as String? ?? 'Acting',
      popularity: (json['popularity'] as num?)?.toDouble(),
      knownFor: credits,
    );
  }

  String? get profileUrl => Env.profileUrl(profilePath);

  List<Movie> get knownForCredits => knownFor;
}
