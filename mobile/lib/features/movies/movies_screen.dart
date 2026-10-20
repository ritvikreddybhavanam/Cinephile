import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../models/genre.dart';
import '../../models/movie.dart';
import '../../services/movie_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/movie_card.dart';

/// Movies Discovery & Search Screen with Genre and Language filtering.
class MoviesScreen extends StatefulWidget {
  const MoviesScreen({super.key});

  @override
  State<MoviesScreen> createState() => _MoviesScreenState();
}

class _MoviesScreenState extends State<MoviesScreen> {
  final MovieService _movieService = MovieService();
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _debounceTimer;

  bool _isLoading = true;
  bool _isLoadingMore = false;
  String? _errorMessage;

  List<Movie> _movies = [];
  List<Genre> _genres = [];

  int _currentPage = 1;
  bool _hasMore = true;

  // Active filters
  int? _selectedGenreId;
  String _selectedSortBy = 'popularity.desc';
  String _searchQuery = '';

  final List<Map<String, String>> _sortOptions = [
    {'label': 'Most Popular', 'value': 'popularity.desc'},
    {'label': 'Top Rated', 'value': 'vote_average.desc'},
    {'label': 'Newest First', 'value': 'primary_release_date.desc'},
  ];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 250 &&
        !_isLoadingMore &&
        _hasMore) {
      _loadMoreMovies();
    }
  }

  Future<void> _loadInitialData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final genres = await _movieService.getGenres();
      _genres = genres;
      await _fetchMovies(page: 1, reset: true);
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchMovies({required int page, bool reset = false}) async {
    try {
      List<Movie> fetched;
      if (_searchQuery.trim().isNotEmpty) {
        fetched = await _movieService.searchMovies(_searchQuery, page: page);
      } else {
        fetched = await _movieService.getMovies(
          page: page,
          sortBy: _selectedSortBy,
          genreId: _selectedGenreId,
        );
      }

      setState(() {
        if (reset) {
          _movies = fetched;
        } else {
          _movies.addAll(fetched);
        }
        _currentPage = page;
        _hasMore = fetched.length >= 10;
        _isLoading = false;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
        _isLoadingMore = false;
      });
    }
  }

  Future<void> _loadMoreMovies() async {
    if (_isLoadingMore || !_hasMore) return;
    setState(() => _isLoadingMore = true);
    await _fetchMovies(page: _currentPage + 1);
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 400), () {
      setState(() {
        _searchQuery = query;
        _isLoading = true;
      });
      _fetchMovies(page: 1, reset: true);
    });
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() {
      _searchQuery = '';
      _isLoading = true;
    });
    _fetchMovies(page: 1, reset: true);
  }

  void _onGenreSelected(int? genreId) {
    if (_selectedGenreId == genreId) {
      _selectedGenreId = null; // Toggle off
    } else {
      _selectedGenreId = genreId;
    }
    setState(() => _isLoading = true);
    _fetchMovies(page: 1, reset: true);
  }

  void _onSortChanged(String? newSort) {
    if (newSort == null || newSort == _selectedSortBy) return;
    setState(() {
      _selectedSortBy = newSort;
      _isLoading = true;
    });
    _fetchMovies(page: 1, reset: true);
  }

  void _openMovieDetails(Movie movie) {
    Navigator.of(context).pushNamed(
      RouteNames.movieDetails,
      arguments: movie.id,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CineAppBar(
        title: 'Discover',
      ),
      body: Column(
        children: [
          // 1. Search Box
          _buildSearchBox(),

          // 2. Genre Filter Pills
          _buildGenreFilterBar(),

          // 3. Sort Filter Row
          _buildSortAndCountRow(),

          // 4. Movie Grid or States
          Expanded(child: _buildGridContent()),
        ],
      ),
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Search movies, titles, franchises...',
          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 18),
                  onPressed: _clearSearch,
                )
              : null,
          filled: true,
          fillColor: AppColors.surface,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildGenreFilterBar() {
    if (_genres.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 38,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _genres.length + 1,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          if (index == 0) {
            final isAll = _selectedGenreId == null;
            return ChoiceChip(
              label: const Text('All Genres'),
              selected: isAll,
              onSelected: (_) => _onGenreSelected(null),
              selectedColor: AppColors.accent,
              backgroundColor: AppColors.surface2,
              side: BorderSide(
                color: isAll ? AppColors.accent : AppColors.border,
                width: 1,
              ),
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: isAll ? FontWeight.w700 : FontWeight.w500,
                color: isAll ? AppColors.background : AppColors.textSecondary,
              ),
            );
          }

          final genre = _genres[index - 1];
          final isSelected = _selectedGenreId == genre.id;

          return ChoiceChip(
            label: Text(genre.name),
            selected: isSelected,
            onSelected: (_) => _onGenreSelected(genre.id),
            selectedColor: AppColors.accent,
            backgroundColor: AppColors.surface2,
            side: BorderSide(
              color: isSelected ? AppColors.accent : AppColors.border,
              width: 1,
            ),
            labelStyle: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? AppColors.background : AppColors.textSecondary,
            ),
          );
        },
      ),
    );
  }

  Widget _buildSortAndCountRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            _searchQuery.isNotEmpty
                ? 'Results for "${_searchQuery.trim()}"'
                : (_selectedGenreId != null
                    ? '${_genres.firstWhere((g) => g.id == _selectedGenreId, orElse: () => const Genre(id: 0, name: '')).name} Cinema'
                    : 'All Films'),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),

          // Sort Dropdown
          DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedSortBy,
              dropdownColor: AppColors.surfaceElevated,
              icon: const Icon(Icons.sort_rounded, size: 16, color: AppColors.accent),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.accent,
              ),
              items: _sortOptions.map((opt) {
                return DropdownMenuItem<String>(
                  value: opt['value'],
                  child: Text(opt['label']!),
                );
              }).toList(),
              onChanged: _onSortChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridContent() {
    if (_isLoading) {
      return const CineLoadingIndicator(message: 'Searching the archive...');
    }

    if (_errorMessage != null) {
      return CineErrorView(
        message: _errorMessage!,
        onRetry: () => _fetchMovies(page: 1, reset: true),
      );
    }

    if (_movies.isEmpty) {
      return CineEmptyView(
        title: 'No Movies Found',
        subtitle: _searchQuery.isNotEmpty
            ? 'We couldn\'t find any titles matching "$_searchQuery". Try checking the spelling or browse by genre.'
            : 'No movies match the selected filters.',
        action: OutlinedButton(
          onPressed: () {
            _clearSearch();
            _onGenreSelected(null);
          },
          child: const Text('Reset All Filters'),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate crossAxisCount based on screen width
        final crossAxisCount = constraints.maxWidth > 600 ? 4 : 2;
        final cardWidth = (constraints.maxWidth - 32 - ((crossAxisCount - 1) * 12)) / crossAxisCount;

        return RefreshIndicator(
          onRefresh: () => _fetchMovies(page: 1, reset: true),
          color: AppColors.accent,
          backgroundColor: AppColors.surface,
          child: GridView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              mainAxisSpacing: 16,
              crossAxisSpacing: 12,
              childAspectRatio: cardWidth / (cardWidth * 1.5 + 46),
            ),
            itemCount: _movies.length + (_isLoadingMore ? crossAxisCount : 0),
            itemBuilder: (context, index) {
              if (index >= _movies.length) {
                return const Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }

              final movie = _movies[index];
              return MovieCard(
                movie: movie,
                width: cardWidth,
                onTap: () => _openMovieDetails(movie),
              );
            },
          ),
        );
      },
    );
  }
}
