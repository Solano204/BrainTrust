package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record BulkRemoveMembersRequest(
        String courseId,
        String groupId,
        List<String> studentIds
) {}