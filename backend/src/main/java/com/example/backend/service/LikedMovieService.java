package com.example.backend.service;

import com.example.backend.entity.LikedMovie;
import com.example.backend.entity.User;
import com.example.backend.repository.LikedMovieRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LikedMovieService {

    private final LikedMovieRepository likedMovieRepository;
    private final UserRepository userRepository;

    public LikedMovieService(
            LikedMovieRepository likedMovieRepository,
            UserRepository userRepository
    ) {
        this.likedMovieRepository = likedMovieRepository;
        this.userRepository = userRepository;
    }

    public void likeMovie(String emailaddress, Long tmdbMovieId) {
        User user = userRepository
                .findByEmailaddress(emailaddress)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        boolean alreadyLiked =
                likedMovieRepository.existsByUserAndTmdbMovieId(
                        user,
                        tmdbMovieId
                );

        if (alreadyLiked) {
            return;
        }

        LikedMovie likedMovie = new LikedMovie();
        likedMovie.setUser(user);
        likedMovie.setTmdbMovieId(tmdbMovieId);
        likedMovie.setLikedAt(LocalDateTime.now());

        likedMovieRepository.save(likedMovie);
    }

    @Transactional
    public void unlikeMovie(String emailaddress, Long tmdbMovieId) {
        User user = userRepository
                .findByEmailaddress(emailaddress)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        likedMovieRepository.deleteByUserAndTmdbMovieId(
                user,
                tmdbMovieId
        );
    }

    public List<LikedMovie> getLikedMovies(String emailaddress) {
        User user = userRepository
                .findByEmailaddress(emailaddress)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return likedMovieRepository.findByUserOrderByLikedAtDesc(user);
    }

    public boolean isMovieLiked(
            String emailaddress,
            Long tmdbMovieId
    ) {
        User user = userRepository
                .findByEmailaddress(emailaddress)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return likedMovieRepository.existsByUserAndTmdbMovieId(
                user,
                tmdbMovieId
        );
    }
}