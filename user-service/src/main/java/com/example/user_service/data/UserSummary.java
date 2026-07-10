package com.example.user_service.data;

public record UserSummary(int id, String name, String email, String role) {
    public static UserSummary from(User user) {
        return new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
