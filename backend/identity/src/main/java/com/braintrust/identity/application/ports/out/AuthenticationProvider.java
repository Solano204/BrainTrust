package com.braintrust.identity.application.ports.out;

import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.Password;
import com.braintrust.identity.domain.valueobjects.UserId;

// 📍 identity/application/ports/out/AuthenticationProvider.java
public interface AuthenticationProvider {
    AuthenticationResult authenticate(Email email, Password password);
    void invalidateSession(UserId userId);
    String generateToken(User user);
}