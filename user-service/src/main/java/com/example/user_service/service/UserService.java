package com.example.user_service.service;

import com.example.user_service.data.User;
import com.example.user_service.data.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByID(int id) {
        return userRepository.findById(id).orElse(null);
    }

    public User addUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(User userDetails) {
        return userRepository.save(userDetails);
    }

    public void deleteUserByID(int id) {
        userRepository.deleteById(id);
    }

    public List<User> getUsersByName(String name) {
        return userRepository.getUsersByName(name);
    }

    public User changePasswordByEmail(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        user.setPassword(password);

        return userRepository.save(user);
    }
}
