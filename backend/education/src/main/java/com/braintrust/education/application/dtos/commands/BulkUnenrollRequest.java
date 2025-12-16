package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record BulkUnenrollRequest(List<String> studentIds) {}
