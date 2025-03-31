package Models;

import lombok.Getter;

@Getter
public class attemptLogInRequest {
    private String email;
    private String password;

    public attemptLogInRequest(String newEmail, String newPassword) {
        this.email = newEmail;
        this.password = newPassword;
    }
}
