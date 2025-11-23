package com.braintrust.education.application.dtos.commands;


public record AddMemberToGroupCommand(
        String groupId,
        String studentId
) {}