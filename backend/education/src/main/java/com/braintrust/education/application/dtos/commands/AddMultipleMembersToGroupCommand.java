package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record AddMultipleMembersToGroupCommand(
        String groupId,
        List<String> memberIds // List of student IDs to add
) {}