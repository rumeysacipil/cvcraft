package com.cvcraft.config;

import com.cvcraft.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
@RequiredArgsConstructor
public class UserDetailsConfig {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            com.cvcraft.model.entity.User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + username));

            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    // Google OAuth users have no password — use empty string placeholder.
                    // Authentication is done via JWT so this is never checked directly.
                    .password(user.getPassword() != null ? user.getPassword() : "")
                    .roles("USER")
                    .build();
        };
    }
}
