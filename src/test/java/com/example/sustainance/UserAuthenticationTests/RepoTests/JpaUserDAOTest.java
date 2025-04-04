package com.example.sustainance.UserAuthenticationTests.RepoTests;

import com.example.sustainance.Errors.UserAlreadyExistsException;
import com.example.sustainance.Errors.UserAlreadyLoggedInException;
import com.example.sustainance.Errors.WrongCredentialsException;
import com.example.sustainance.Models.JSONClasses.RegisterUserRequest;
import com.example.sustainance.Models.JSONClasses.attemptLogInRequest;
import com.example.sustainance.Models.User;
import com.example.sustainance.Repository.SQLImpl.JpaUserDAO;
import com.example.sustainance.Repository.SQLImpl.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static com.example.sustainance.Constants.englishConstants.*;

@DataJpaTest
@Import({JpaUserDAO.class, BCryptPasswordEncoder.class})
class JpaUserDAOTest {

    @Autowired
    private JpaUserDAO userDAO;

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final String TEST_EMAIL = "test@test.com";
    private final String TEST_PASSWORD = "password123";

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void alreadyRegistered_WhenUserDoesNotExist_ReturnsFalse() throws UserAlreadyExistsException {
        assertFalse(userDAO.alreadyRegistered(TEST_EMAIL));
    }

    @Test
    void alreadyRegistered_WhenUserExists_ThrowsException() {
        // Arrange
        User user = new User(TEST_EMAIL, TEST_PASSWORD);
        userRepository.save(user);

        // Act & Assert
        assertThrows(UserAlreadyExistsException.class, () ->
                userDAO.alreadyRegistered(TEST_EMAIL)
        );
    }

    @Test
    void registerUser_SavesUserWithHashedPassword() {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest(TEST_EMAIL, TEST_PASSWORD);

        // Act
        userDAO.registerUser(request);

        // Assert
        User savedUser = userRepository.findByEmail(TEST_EMAIL).orElse(null);
        assertNotNull(savedUser);
        assertTrue(passwordEncoder.matches(TEST_PASSWORD, savedUser.getPassword()));
        assertNotEquals(TEST_PASSWORD, savedUser.getPassword()); // Password should be hashed
    }

    @Test
    void userExists_WhenUserExists_ReturnsTrue() {
        // Arrange
        User user = new User(TEST_EMAIL, TEST_PASSWORD);
        userRepository.save(user);

        // Act & Assert
        assertTrue(userDAO.userExists(TEST_EMAIL));
    }

    @Test
    void userExists_WhenUserDoesNotExist_ReturnsFalse() {
        assertFalse(userDAO.userExists(TEST_EMAIL));
    }

    @Test
    void checkCredentials_WithValidCredentials_ReturnsTrue() throws Exception {
        // Arrange
        String hashedPassword = passwordEncoder.encode(TEST_PASSWORD);
        User user = new User(TEST_EMAIL, hashedPassword);
        userRepository.save(user);

        attemptLogInRequest request = new attemptLogInRequest(TEST_EMAIL, TEST_PASSWORD);

        // Act
        boolean result = userDAO.checkCredentials(request);

        // Assert
        assertTrue(result);
        User updatedUser = userRepository.findByEmail(TEST_EMAIL).orElse(null);
        assertNotNull(updatedUser);
        assertTrue(updatedUser.isActive());
    }

    @Test
    void checkCredentials_WithWrongPassword_ThrowsException() {
        // Arrange
        String hashedPassword = passwordEncoder.encode(TEST_PASSWORD);
        User user = new User(TEST_EMAIL, hashedPassword);
        userRepository.save(user);

        attemptLogInRequest request = new attemptLogInRequest(TEST_EMAIL, "wrongpassword");

        // Act & Assert
        assertThrows(WrongCredentialsException.class, () ->
                userDAO.checkCredentials(request)
        );
    }

    @Test
    void checkCredentials_WhenUserAlreadyActive_ThrowsException() {
        // Arrange
        String hashedPassword = passwordEncoder.encode(TEST_PASSWORD);
        User user = new User(TEST_EMAIL, hashedPassword);
        user.setActive(true);
        userRepository.save(user);

        attemptLogInRequest request = new attemptLogInRequest(TEST_EMAIL, TEST_PASSWORD);

        // Act & Assert
        assertThrows(UserAlreadyLoggedInException.class, () ->
                userDAO.checkCredentials(request)
        );
    }

    @Test
    void setUserAsInactive_SetsUserInactive() throws Exception {
        // Arrange
        String hashedPassword = passwordEncoder.encode(TEST_PASSWORD);
        User user = new User(TEST_EMAIL, hashedPassword);
        user.setActive(true);
        userRepository.save(user);

        // Act
        userDAO.setUserAsInactive(TEST_EMAIL);

        // Assert
        User updatedUser = userRepository.findByEmail(TEST_EMAIL).orElse(null);
        assertNotNull(updatedUser);
        assertFalse(updatedUser.isActive());
    }

    @Test
    void setUserAsInactive_WithNonexistentUser_DoesNotThrowException() {
        // Act & Assert
        assertDoesNotThrow(() -> userDAO.setUserAsInactive("nonexistent@test.com"));
    }
}