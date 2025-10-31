package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;


/**
 * Defines the access roles within the BrainTrust platform.
 * Used for authentication and authorization.
 */
public enum Role {
    // Standard roles for the education platform
    STUDENT,
    TEACHER,
    ADMIN,

    // System-level role, if needed
    SYS_MANAGER
}