package Models;

import lombok.Getter;

@Getter
public class User {
    private final String email;
    private final String password;

    public User(String newEmail, String newPassword) {
        this.email = newEmail;
        this.password = newPassword;
    }
}
