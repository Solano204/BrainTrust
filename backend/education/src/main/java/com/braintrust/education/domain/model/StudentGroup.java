package com.braintrust.education.domain.model;


import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;
import java.time.LocalDateTime;
import java.util.*;
public class StudentGroup extends AggregateRoot<StudentGroupId> {
    private CourseId courseId;
    private String name;
    private String description;
    private final Set<UserId> memberIds;
    private LocalDateTime createdAt;
    private boolean active;
    private static final int MAX_MEMBERS = 10;

    private StudentGroup(StudentGroupId id, CourseId courseId, String name) {
        this.id = id;
        this.courseId = courseId;
        this.name = validateName(name);
        this.memberIds = new HashSet<>();
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    // ✅ Factory Method for NEW Group
    public static StudentGroup create(CourseId courseId, String name, String description) {
        StudentGroupId id = StudentGroupId.generate();
        StudentGroup group = new StudentGroup(id, courseId, name);
        group.description = description;
        return group;
    }

    // ✅ Reconstitute from database
    public static StudentGroup reconstitute(StudentGroupId id, CourseId courseId,
                                            String name, String description,
                                            Set<UserId> memberIds, LocalDateTime createdAt,
                                            boolean active) {
        StudentGroup group = new StudentGroup(id, courseId, name);
        group.description = description;
        group.createdAt = createdAt;
        group.active = active;
        if (memberIds != null) {
            group.memberIds.addAll(memberIds);
        }
        return group;
    }

    // 🎯 Domain Behavior
    public void addMember(UserId studentId) {
        if (memberIds.size() >= MAX_MEMBERS) {
            throw new IllegalStateException("Group is full. Maximum " + MAX_MEMBERS + " members allowed.");
        }
        if (memberIds.contains(studentId)) {
            throw new IllegalArgumentException("Student already in group");
        }
        memberIds.add(studentId);
    }


    // ✅ NEW: Get available slots
    public int getAvailableSlots() {
        return MAX_MEMBERS - memberIds.size();
    }

    // ✅ NEW: Check if can add members
    public boolean canAddMembers(int numberOfMembers) {
        return memberIds.size() + numberOfMembers <= MAX_MEMBERS;
    }



    // ✅ NEW: Bulk add members with validation
    public void addMembers(Set<UserId> studentIds) {
        if (memberIds.size() + studentIds.size() > MAX_MEMBERS) {
            throw new IllegalStateException(
                    String.format("Cannot add %d members. Group would exceed maximum of %d members",
                            studentIds.size(), MAX_MEMBERS)
            );
        }



        // Check for duplicates within the new set
        Set<UserId> uniqueNewMembers = new HashSet<>(studentIds);
        if (uniqueNewMembers.size() != studentIds.size()) {
            throw new IllegalArgumentException("Duplicate student IDs in the provided list");
        }

        // Check for existing members
        for (UserId studentId : studentIds) {
            if (memberIds.contains(studentId)) {
                throw new IllegalArgumentException("Student " + studentId.getValue() + " already in group");
            }
        }

        memberIds.addAll(studentIds);
    }

    public void removeMember(UserId studentId) {
        if (!memberIds.remove(studentId)) {
            throw new IllegalArgumentException("Student not in group");
        }
    }

    public boolean isMember(UserId studentId) {
        return memberIds.contains(studentId);
    }

    public void deactivate() {
        this.active = false;
    }

    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Group name cannot be null or empty");
        }
        return name.trim();
    }

    // Getters
    public CourseId getCourseId() { return courseId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Set<UserId> getMemberIds() { return Set.copyOf(memberIds); }
    public int getMemberCount() { return memberIds.size(); }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isActive() { return active; }
}