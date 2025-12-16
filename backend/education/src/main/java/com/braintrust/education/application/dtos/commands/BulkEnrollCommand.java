package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record BulkEnrollCommand(String courseId, List<String> studentIds) {}
