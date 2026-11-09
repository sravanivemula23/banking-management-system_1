package com.banking.config;

import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Creates the first ADMIN user from environment variables. Admins can never self-register via the API. */
@Configuration
public class AdminSeeder {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    @Bean
    CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder encoder,
                                @Value("${app.admin.name}") String name,
                                @Value("${app.admin.email}") String email,
                                @Value("${app.admin.password}") String password) {
        return args -> {
            if (password == null || password.isBlank()) {
                log.warn("ADMIN_PASSWORD not set: skipping admin seeding");
                return;
            }
            if (users.existsByEmail(email)) {
                return;
            }
            users.save(User.builder()
                    .name(name)
                    .email(email.toLowerCase())
                    .password(encoder.encode(password))
                    .role(Role.ADMIN)
                    .build());
            log.info("Seeded admin user {}", email);
        };
    }
}
