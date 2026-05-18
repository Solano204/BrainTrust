package com.braintrust.education.application.dtos.dtos;

import java.util.List;


import java.util.List;

public record StudentGroupDTO(
        String id,
        String courseId,
        String courseName,
        String name,
        String description,
        List<GroupMemberDTO> members,
        int memberCount,
        String createdAt,
        boolean active
) {}