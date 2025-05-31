package com.example.sustainance.interfaces;

import com.example.sustainance.models.userAuth.*;

public interface TokensDAO {
    void addNewToken(createTokenRequest request);
    getTokenResponse getToken(getTokenRequest request);
    attemptTokenAuthResponse attemptTokenAuth(attemptTokenAuthRequest request);
}
