package com.braintrust.identity.application.dtos.dtos;

// 📍 identity/application/dtos/AuthenticationResult.java
public record AuthenticationResult(
        boolean success,
        UserDTO user,
        String token,
        String failureReason
) {
 public static AuthenticationResult success(UserDTO user, String token) {
  return new AuthenticationResult(true, user, token, null);
 }

 public static AuthenticationResult failure(String failureReason) {
  return new AuthenticationResult(false, null, null, failureReason);
 }
}