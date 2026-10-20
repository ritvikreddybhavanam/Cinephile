import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/movie.dart';
import '../../services/cinematch_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/rating_badge.dart';

/// Screen implementing CineMatch social swiping for co-watching movies with friends.
class CineMatchScreen extends StatefulWidget {
  const CineMatchScreen({super.key});

  @override
  State<CineMatchScreen> createState() => _CineMatchScreenState();
}

class _CineMatchScreenState extends State<CineMatchScreen> {
  final CineMatchService _service = CineMatchService();
  final TextEditingController _codeController = TextEditingController();

  CineMatchRoom? _room;
  int _cardIndex = 0;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _createRoom() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final room = await _service.createRoom();
      setState(() {
        _room = room;
        _cardIndex = 0;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _joinRoom() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final room = await _service.joinRoom(code);
      setState(() {
        _room = room;
        _cardIndex = 0;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _startSwiping() async {
    if (_room == null) return;
    setState(() => _isLoading = true);
    try {
      final room = await _service.startSwiping(_room!.roomCode);
      setState(() {
        _room = room;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _swipe(bool isLike) async {
    if (_room == null) return;
    final movies = _room!.candidateMovies;
    if (_cardIndex >= movies.length) return;

    final currentMovie = movies[_cardIndex];
    setState(() {
      _cardIndex++;
    });

    try {
      final updatedRoom = await _service.swipeMovie(
        _room!.roomCode,
        currentMovie.id,
        isLike,
      );

      setState(() {
        _room = updatedRoom;
      });

      if (updatedRoom.matchedMovie != null || updatedRoom.status == 'MATCHED') {
        _showMatchDialog(updatedRoom.matchedMovie ?? currentMovie);
      }
    } catch (_) {}
  }

  void _showMatchDialog(Movie movie) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.celebration_rounded,
              color: AppColors.accent,
              size: 48,
            ),
            const SizedBox(height: 12),
            const Text(
              "IT'S A MATCH!",
              style: TextStyle(
                fontFamily: 'Georgia',
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.accent,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Both of you picked this film. Enjoy your movie night!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: movie.posterUrl != null
                  ? Image.network(
                      movie.posterUrl!,
                      height: 140,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.movie, size: 40),
                    )
                  : const Icon(Icons.movie, size: 40),
            ),
            const SizedBox(height: 12),
            Text(
              movie.title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              setState(() => _room = null);
            },
            child: const Text('New Session'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pushNamed(
                RouteNames.movieDetails,
                arguments: movie.id,
              );
            },
            child: const Text('View Film Details'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CineAppBar(title: 'CineMatch'),
      body: _room == null
          ? _buildLobby()
          : _room!.status == 'WAITING'
              ? _buildWaitingRoom()
              : _buildSwipingArena(),
    );
  }

  Widget _buildLobby() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.favorite_rounded,
              size: 48,
              color: AppColors.accent,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Movie Night Matchmaker',
            style: TextStyle(
              fontFamily: 'Georgia',
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Swipe on movies together with your partner or friend. CineMatch finds titles you both want to watch!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 32),

          if (_errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.error.withValues(alpha: 0.4)),
              ),
              child: Text(
                _errorMessage!,
                style: const TextStyle(fontSize: 12, color: AppColors.error),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Create Room Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Text(
                  'Host a Match Session',
                  style: TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Create a private room and invite a friend using a 6-character room code',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _createRoom,
                    icon: const Icon(Icons.add_rounded),
                    label: _isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.background,
                            ),
                          )
                        : const Text('Create Room', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Join Room Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Text(
                  'Join a Friend\'s Session',
                  style: TextStyle(
                    fontFamily: 'Georgia',
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _codeController,
                  textCapitalization: TextCapitalization.characters,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    letterSpacing: 4,
                    fontWeight: FontWeight.w700,
                    color: AppColors.accent,
                  ),
                  decoration: const InputDecoration(
                    hintText: 'ROOM CODE',
                    contentPadding: EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _joinRoom,
                    icon: const Icon(Icons.login_rounded),
                    label: const Text('Join Room', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWaitingRoom() {
    final room = _room!;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            'ROOM CODE',
            style: TextStyle(
              fontSize: 13,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: room.roomCode));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Room code copied to clipboard!')),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.accent, width: 1.5),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    room.roomCode,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 6,
                      color: AppColors.accent,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.copy_rounded, color: AppColors.accent, size: 20),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Host: ${room.hostUsername}',
            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
          if (room.participantUsername != null) ...[
            const SizedBox(height: 6),
            Text(
              'Participant: ${room.participantUsername}',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.accent,
              ),
            ),
          ] else ...[
            const SizedBox(height: 8),
            const Text(
              'Waiting for partner to join with room code...',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.textMuted),
            ),
          ],
          const SizedBox(height: 40),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _startSwiping,
              child: const Text('Start Swiping', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => setState(() => _room = null),
            child: const Text('Leave Room', style: TextStyle(color: AppColors.textMuted)),
          ),
        ],
      ),
    );
  }

  Widget _buildSwipingArena() {
    final movies = _room?.candidateMovies ?? [];

    if (_cardIndex >= movies.length) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.done_all_rounded, size: 56, color: AppColors.accent),
              const SizedBox(height: 16),
              const Text(
                'All Candidates Swiped!',
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Waiting for your partner to finish swiping to reveal matches.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => setState(() => _room = null),
                child: const Text('Return to Lobby'),
              ),
            ],
          ),
        ),
      );
    }

    final movie = movies[_cardIndex];

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          // Progress bar
          LinearProgressIndicator(
            value: (_cardIndex + 1) / movies.length,
            backgroundColor: AppColors.surface,
            color: AppColors.accent,
          ),
          const SizedBox(height: 12),
          Text(
            'Film ${_cardIndex + 1} of ${movies.length}',
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
          const SizedBox(height: 12),

          // Main Swipe Card
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (movie.posterUrl != null)
                    Image.network(
                      movie.posterUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.surfaceElevated,
                        child: const Icon(Icons.movie, size: 64, color: AppColors.textMuted),
                      ),
                    )
                  else
                    Container(
                      color: AppColors.surfaceElevated,
                      child: const Icon(Icons.movie, size: 64, color: AppColors.textMuted),
                    ),
                  // Gradient vignette
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          AppColors.background.withValues(alpha: 0.9),
                        ],
                        stops: const [0.45, 1.0],
                      ),
                    ),
                  ),
                  // Content
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            RatingBadge(rating: movie.voteAverage),
                            const SizedBox(width: 8),
                            Text(
                              movie.year,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.accent,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          movie.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Georgia',
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (movie.overview.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            movie.overview,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Swipe Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Pass / Dislike
              GestureDetector(
                onTap: () => _swipe(false),
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.6), width: 1.5),
                  ),
                  child: const Icon(
                    Icons.close_rounded,
                    color: AppColors.error,
                    size: 32,
                  ),
                ),
              ),

              // Like / Match
              GestureDetector(
                onTap: () => _swipe(true),
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.accent.withValues(alpha: 0.35),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.favorite_rounded,
                    color: AppColors.background,
                    size: 32,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
