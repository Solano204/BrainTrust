package com.braintrust.education.application.dtos.commands;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// For adding a single link
public record AddLinkCommand(
        @NotBlank(message = "Link URL is required")
        String linkUrl
) {}