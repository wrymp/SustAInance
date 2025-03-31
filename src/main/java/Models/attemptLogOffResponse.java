package Models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class attemptLogOffResponse {
    private boolean result;
    private String reason;

    public attemptLogOffResponse(boolean newResult, String newReason) {
        this.result = newResult;
        this.reason = newReason;
    }
}
