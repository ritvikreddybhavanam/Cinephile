import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/config/env.dart';
import 'package:mobile/models/genre.dart';
import 'package:mobile/models/movie.dart';
import 'package:mobile/models/movie_detail.dart';

void main() {
  group('Movie Model Tests', () {
    test('Movie parses TMDB JSON accurately with safe fallbacks', () {
      final json = {
        'id': 550,
        'title': 'Fight Club',
        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        'backdrop_path': '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
        'overview': 'An insomniac office worker...',
        'release_date': '1999-10-15',
        'vote_average': 8.433,
        'vote_count': 26000,
        'genre_ids': [18, 53],
      };

      final movie = Movie.fromJson(json);

      expect(movie.id, 550);
      expect(movie.title, 'Fight Club');
      expect(movie.year, '1999');
      expect(movie.ratingFormatted, '8.4');
      expect(movie.posterUrl, contains('image.tmdb.org'));
      expect(movie.backdropUrl, contains('image.tmdb.org'));
      expect(movie.genreIds, [18, 53]);
    });

    test('Movie parses missing ratings and dates safely', () {
      final json = {
        'id': 100,
        'name': 'Untitled Film',
      };

      final movie = Movie.fromJson(json);

      expect(movie.id, 100);
      expect(movie.title, 'Untitled Film');
      expect(movie.year, '—');
      expect(movie.ratingFormatted, 'NR');
      expect(movie.posterUrl, isNull);
    });
  });

  group('MovieDetail Model Tests', () {
    test('MovieDetail parses runtime, genres, and financial data', () {
      final json = {
        'id': 27205,
        'title': 'Inception',
        'tagline': 'Your mind is the scene of the crime.',
        'overview': 'Cobb, a skilled thief...',
        'release_date': '2010-07-15',
        'runtime': 148,
        'vote_average': 8.364,
        'vote_count': 35000,
        'genres': [
          {'id': 28, 'name': 'Action'},
          {'id': 878, 'name': 'Science Fiction'},
        ],
        'budget': 160000000,
        'revenue': 825532764,
      };

      final detail = MovieDetail.fromJson(json);

      expect(detail.id, 27205);
      expect(detail.title, 'Inception');
      expect(detail.runtimeFormatted, '2h 28m');
      expect(detail.year, '2010');
      expect(detail.genres.length, 2);
      expect(detail.genres[0].name, 'Action');
      expect(detail.genres[1].name, 'Science Fiction');
    });
  });

  group('Genre Model Tests', () {
    test('Genre parses id and name', () {
      final genre = Genre.fromJson({'id': 28, 'name': 'Action'});
      expect(genre.id, 28);
      expect(genre.name, 'Action');
    });
  });

  group('Env Config Tests', () {
    test('Env builds TMDB URLs correctly', () {
      final poster = Env.posterUrl('/test.jpg');
      expect(poster, 'https://image.tmdb.org/t/p/w500/test.jpg');

      final backdrop = Env.backdropUrl('/backdrop.jpg');
      expect(backdrop, 'https://image.tmdb.org/t/p/original/backdrop.jpg');
    });

    test('Env supports custom base URL overrides', () {
      Env.setCustomBaseUrl('http://192.168.1.50:8080');
      expect(Env.apiBaseUrl, 'http://192.168.1.50:8080/api');

      // Reset override
      Env.setCustomBaseUrl(null);
    });
  });
}
