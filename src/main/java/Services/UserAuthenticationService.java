package Services;

import Interfaces.UserDAO;
import Models.*;

import java.util.HashSet;
import java.util.Set;

import static Constants.englishConstants.*;

public class UserAuthenticationService {
    private UserDAO userDAO;
    private Set<String> CurrentlyActives;

    public UserAuthenticationService(){
//        this.userDAO = MySQLUserDAO();
        this.userDAO = new BasicUserDAO();
        this.CurrentlyActives = new HashSet<>();
    }

    public RegisterUserResponse registerUser(RegisterUserRequest request){
        RegisterUserResponse response = new RegisterUserResponse(false, null);

        if(this.userDAO.alreadyRegistered(request.getEmail())){
            response.setResult(false);
            response.setReason(USER_ALREADY_REGISTERED_RESPONSE);
            return response;
        }

        this.userDAO.registerUser(request);
        response.setResult(true);
        response.setReason(USER_SUCCESSFULLY_REGISTERED_RESPONSE);
        return response;
    }

    public attemptLogInResponse attemptLogIn(attemptLogInRequest request){
        attemptLogInResponse response = new attemptLogInResponse(false, null);

        if(!this.userDAO.userExists(request.getEmail())){
            response.setResult(false);
            response.setReason(USER_DOESNT_EXIST_RESPONSE);
            return response;
        }

        if(this.checkIfUserIsActive(request.getEmail())){
            response.setResult(false);
            response.setReason(USER_ALREADY_LOGGED_IN_RESPONSE);
            return response;
        }

        if(this.userDAO.checkCredentials(request)){
            this.setUserAsActive(request.getEmail());
            response.setResult(true);
            response.setReason(USER_SUCCESSFULLY_LOGGED_IN_RESPONSE);
            return response;
        } else {
            response.setResult(false);
            response.setReason(WRONG_LOG_IN_CREDENTIALS_RESPONSE);
            return response;
        }
    }

    private void setUserAsActive(String email) {
        this.CurrentlyActives.add(email);
    }
    private boolean checkIfUserIsActive(String email) {
        return this.CurrentlyActives.contains(email);
    }

    private void setUserAsInactive(String email) {
        this.CurrentlyActives.remove(email);
    }

    public attemptLogOffResponse attemptLogOff(attemptLogoffRequest request){
        attemptLogOffResponse response = new attemptLogOffResponse(true, USER_LOGGED_OFF);
        this.setUserAsInactive(request.getEmail());
        return response;
    }

}
