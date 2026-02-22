package com.braintrust.education.application.helpers.studentgroup;

import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.CourseId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentGroupValidator {

    private final StudentGroupRepository groupRepository;

    public void validateGroupNameUniqueness(String name, CourseId courseId) {
        if (groupRepository.existsByNameAndCourse(name, courseId)) {
            throw new IllegalArgumentException(
                    "Group with name '" + name + "' already exists in this course"
            );
        }
    }

    public void validateGroupIsActive(StudentGroup group) {
        if (!group.isActive()) {
            throw new IllegalStateException(
                    "Cannot update information of an inactive group"
            );
        }
    }

    public void validateGroupNameChange(StudentGroup group, String newName) {
        if (!group.getName().equals(newName)) {
            boolean nameExists = groupRepository.existsByNameAndCourse(
                    newName,
                    group.getCourseId()
            );
            if (nameExists) {
                throw new IllegalArgumentException(
                        "A group with name '" + newName + "' already exists in this course"
                );
            }
        }
    }

    public void validateGroupBelongsToCourse(StudentGroup group, String courseId) {
        if (!group.getCourseId().getValue().equals(courseId)) {
            throw new IllegalArgumentException(
                    "Group does not belong to the specified course"
            );
        }
    }
}