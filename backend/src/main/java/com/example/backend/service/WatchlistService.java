package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.Watchlist;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;

    public WatchlistService(
            WatchlistRepository watchlistRepository,
            UserRepository userRepository) {

        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
    }

    public List<Watchlist> getWatchlist(String email) {

        User user = userRepository
                .findByEmailaddress(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return watchlistRepository.findByUser(user);
    }

    public Watchlist addToWatchlist(
            String email,
            Long movieId,
            String title,
            String poster) {

        User user = userRepository
                .findByEmailaddress(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (watchlistRepository.existsByUserAndMovieId(
                user,
                movieId)) {

            throw new RuntimeException(
                    "Movie already in watchlist"
            );
        }

        Watchlist watchlist = new Watchlist();

        watchlist.setUser(user);
        watchlist.setMovieId(movieId);
        watchlist.setTitle(title);
        watchlist.setPoster(poster);

        return watchlistRepository.save(watchlist);
    }

    @Transactional
    public void removeFromWatchlist(
            String email,
            Long movieId) {

        User user = userRepository
                .findByEmailaddress(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        watchlistRepository.deleteByUserAndMovieId(
                user,
                movieId
        );
    }

    public boolean isInWatchlist(
            String email,
            Long movieId) {

        User user = userRepository
                .findByEmailaddress(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return watchlistRepository.existsByUserAndMovieId(
                user,
                movieId
        );
    }
}