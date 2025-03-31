package Models;

import lombok.Getter;

@Getter
public class attemptLogoffRequest {
    private String email;
    public attemptLogoffRequest(String newEmail, String newPassword) {
        this.email = newEmail;
    }
}
