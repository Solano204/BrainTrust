package com.braintrust.education.application.dtos.commands;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record AddLinksCommand(


        @Size(min = 1, message = "At least one link is required")
//        @Pattern(regexp = "^(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]",
//                message = "Must provide valid URLs")
        String link
) {}