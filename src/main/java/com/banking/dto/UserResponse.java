package com.banking.dto;

import com.banking.entity.Role;
import com.banking.entity.User;

import java.time.LocalDateTime;

/** Never includes the password hash. */
public record UserResponse(Long id, String name, String email, Role role, LocalDateTime createdAt) {

    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt());
    }
}
