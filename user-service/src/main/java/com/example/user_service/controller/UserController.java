package com.example.user_service.controller;

import com.example.user_service.data.User;
import com.example.user_service.data.LoginRequest;
import com.example.user_service.data.UserProfileUpdateRequest;
import com.example.user_service.data.UserSummary;
import com.example.user_service.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(path = "/users")
    public List<UserSummary> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(UserSummary::from)
                .toList();
    }

    @GetMapping(path = "/users/{id}")
    public User getUserByID(@PathVariable int id) {
        return userService.getUserByID(id);
    }

    @PostMapping(path = "/users")
    public User addUser(@RequestBody User newUser) {
        return userService.addUser(newUser);
    }

    @PostMapping(path = "/users/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.authenticate(loginRequest.email(), loginRequest.password());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    @PutMapping(path = "/users")
    public User updateUser(@RequestBody User userDetails) {
        return userService.updateUser(userDetails);
    }

    @PutMapping(path = "/users/{id}/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@PathVariable int id,
                                                               @RequestBody UserProfileUpdateRequest updateRequest) {
        User user = userService.updateProfile(id, updateRequest.name(), updateRequest.email());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    @DeleteMapping(path = "/users/{id}")
    public void deleteUserById(@PathVariable int id) {
        userService.deleteUserByID(id);
    }

    @GetMapping(path = "/users", params = {"name"})
    public List<User> getUsersByName(@RequestParam String name) {
        return userService.getUsersByName(name);
    }

    @PutMapping(path = "/users", params = {"email", "password"})
    public User changePasswordByEmail(@RequestParam String email, @RequestParam String password) {
        return userService.changePasswordByEmail(email,password);
    }
}
