package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.commands.AuthenticateUserCommand;
import com.braintrust.identity.application.dtos.commands.RefreshTokenCommand;
import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.infraestructure.security.services.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import static com.braintrust.identity.application.Maps.EntityMaps.toUserDTO;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findPersonByIdOrThrow;

@Component
public class UserAuthenticationHelper {

    private static final Logger log = LoggerFactory.getLogger(UserAuthenticationHelper.class);

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public UserAuthenticationHelper(
            UserRepository userRepository,
            PersonRepository personRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Transactional(readOnly = true)
    public AuthenticationResult authenticate(AuthenticateUserCommand command) {
        long startTime = System.currentTimeMillis();

        log.info("Authenticating user email={}", command.email());

        try {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            command.email(),
                            command.password()
                    )
            );

            Email email = new Email(command.email());
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (!user.isActive()) {
                log.warn("Authentication rejected: inactive user email={}", command.email());
                return AuthenticationResult.failure("User account is inactive");
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String accessToken = jwtService.generateAccessToken(userDetails, user.getId());
            String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Authentication successful durationMs={} userId={}", duration, user.getId().getValue());

            return AuthenticationResult.success(userDTO, accessToken, refreshToken, 900L);

        } catch (BadCredentialsException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Authentication failed: invalid credentials durationMs={} email={}", duration, command.email());
            return AuthenticationResult.failure("Invalid email or password");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Authentication error durationMs={} email={}: {}", duration, command.email(), e.getMessage(), e);
            return AuthenticationResult.failure("Authentication failed: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public AuthenticationResult refreshToken(RefreshTokenCommand command) {
        long startTime = System.currentTimeMillis();

        log.debug("Processing refresh token request");

        try {
            String username = jwtService.extractUsername(command.refreshToken());

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isRefreshTokenValid(command.refreshToken(), userDetails)) {
                log.warn("Token refresh rejected: invalid refresh token for user={}", username);
                return AuthenticationResult.failure("Invalid refresh token");
            }

            Email email = new Email(username);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (!user.isActive()) {
                log.warn("Token refresh rejected: inactive user={}", username);
                return AuthenticationResult.failure("User account is inactive");
            }

            String newAccessToken = jwtService.generateAccessToken(userDetails, user.getId());
            String newRefreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Token refresh successful durationMs={} user={}", duration, username);

            return AuthenticationResult.success(userDTO, newAccessToken, newRefreshToken, 900L);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Token refresh failed durationMs={}: {}", duration, e.getMessage(), e);
            return AuthenticationResult.failure("Token refresh failed: " + e.getMessage());
        }
    }
}