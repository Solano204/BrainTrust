package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record BulkUnenrollCommand(String courseId, List<String> studentIds) {}
