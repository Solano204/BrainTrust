package com.braintrust.education.application.dtos.commands;

public record RemoveMemberFromGroupCommand(
        String groupId,
        String studentId
) {}