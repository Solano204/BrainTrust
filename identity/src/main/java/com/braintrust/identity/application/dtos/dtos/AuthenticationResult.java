package com.braintrust.identity.application.dtos.dtos;

// 📍 identity/application/dtos/AuthenticationResult.java

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthenticationResult(
        boolean success,
        UserDTO user,
        String accessToken,
        String refreshToken,
        Long expiresIn,  // in seconds
        String tokenType,
        String failureReason
) {
 public static AuthenticationResult success(UserDTO user, String accessToken,
                                            String refreshToken, Long expiresIn) {
  return new AuthenticationResult(
          true,
          user,
          accessToken,
          refreshToken,
          expiresIn,
          "Bearer",
          null
  );
 }

 public static AuthenticationResult failure(String reason) {
  return new AuthenticationResult(
          false,
          null,
          null,
          null,
          null,
          null,
          reason
  );
 }
}