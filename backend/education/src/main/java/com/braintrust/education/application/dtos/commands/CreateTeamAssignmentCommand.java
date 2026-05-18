package com.braintrust.education.application.dtos.commands;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record CreateTeamAssignmentCommand(
        String courseId,
        String unitId,

        String title,
        String description,
        String dueDate,
        int maxPoints,
        String instructions,
        List<MultipartFile> attachments
) {}