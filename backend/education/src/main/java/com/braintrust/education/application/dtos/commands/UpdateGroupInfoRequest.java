package com.braintrust.education.application.dtos.commands;


public record UpdateGroupInfoRequest(
        String name,
        String description
) {}