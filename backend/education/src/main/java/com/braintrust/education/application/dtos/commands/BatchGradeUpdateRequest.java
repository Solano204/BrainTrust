package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record BatchGradeUpdateRequest(
        List<RapidBatchGradeUpdate> updates
) {}
