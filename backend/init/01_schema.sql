-- ============================================================================
-- COMPLETE DATABASE SCHEMA RECREATION SCRIPT
-- This script drops all existing tables and recreates them with all
-- columns, constraints, primary keys, indexes, and foreign key relationships
-- ============================================================================

-- Drop all existing tables in the correct order (respecting foreign keys)
DROP TABLE IF EXISTS "public"."page_external_links" CASCADE;
DROP TABLE IF EXISTS "public"."documents" CASCADE;
DROP TABLE IF EXISTS "public"."analysis_requests" CASCADE;
DROP TABLE IF EXISTS "public"."quiz_submissions" CASCADE;
DROP TABLE IF EXISTS "public"."quiz_questions" CASCADE;
DROP TABLE IF EXISTS "public"."quizzes" CASCADE;
DROP TABLE IF EXISTS "public"."submissions" CASCADE;
DROP TABLE IF EXISTS "public"."assignment_links" CASCADE;
DROP TABLE IF EXISTS "public"."assignments" CASCADE;
DROP TABLE IF EXISTS "public"."unit_grades" CASCADE;
DROP TABLE IF EXISTS "public"."gradebooks" CASCADE;
DROP TABLE IF EXISTS "public"."group_members" CASCADE;
DROP TABLE IF EXISTS "public"."student_groups" CASCADE;
DROP TABLE IF EXISTS "public"."enrollments" CASCADE;
DROP TABLE IF EXISTS "public"."pages" CASCADE;
DROP TABLE IF EXISTS "public"."course_units" CASCADE;
DROP TABLE IF EXISTS "public"."user_roles" CASCADE;
DROP TABLE IF EXISTS "public"."users" CASCADE;
DROP TABLE IF EXISTS "public"."courses" CASCADE;
DROP TABLE IF EXISTS "public"."persons" CASCADE;
DROP TABLE IF EXISTS "public"."cat_postal_codes" CASCADE;
DROP TABLE IF EXISTS "public"."cat_streets" CASCADE;
DROP TABLE IF EXISTS "public"."cat_colonies" CASCADE;
DROP TABLE IF EXISTS "public"."cat_municipalities" CASCADE;
DROP TABLE IF EXISTS "public"."cat_states" CASCADE;
DROP TABLE IF EXISTS "public"."cat_role_activities" CASCADE;
DROP TABLE IF EXISTS "public"."cat_roles" CASCADE;
DROP TABLE IF EXISTS "public"."cat_last_names" CASCADE;
DROP TABLE IF EXISTS "public"."cat_first_names" CASCADE;

-- ============================================================================
-- CREATE SEQUENCES
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS cat_states_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_first_names_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_last_names_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_municipalities_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_colonies_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_streets_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_postal_codes_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_roles_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cat_role_activities_id_seq START 1;

-- ============================================================================
-- 1. CATALOG TABLES (No dependencies)
-- ============================================================================

CREATE TABLE "public"."cat_states" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_states_id_seq'::regclass),
    "state_name" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("state_name")
);

CREATE TABLE "public"."cat_first_names" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_first_names_id_seq'::regclass),
    "first_name" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("first_name")
);

CREATE TABLE "public"."cat_last_names" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_last_names_id_seq'::regclass),
    "last_name" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("last_name")
);

CREATE TABLE "public"."cat_roles" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_roles_id_seq'::regclass),
    "code" CHARACTER VARYING NOT NULL,
    "description" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("code")
);

CREATE TABLE "public"."cat_municipalities" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_municipalities_id_seq'::regclass),
    "state_id" INTEGER NOT NULL,
    "municipality_name" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_cat_municipalities_state" FOREIGN KEY ("state_id") REFERENCES "public"."cat_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "public"."cat_colonies" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_colonies_id_seq'::regclass),
    "municipality_id" INTEGER NOT NULL,
    "colony_name" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_cat_colonies_municipality" FOREIGN KEY ("municipality_id") REFERENCES "public"."cat_municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "public"."cat_streets" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_streets_id_seq'::regclass),
    "colony_id" INTEGER NOT NULL,
    "street_name" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_cat_streets_colony" FOREIGN KEY ("colony_id") REFERENCES "public"."cat_colonies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "public"."cat_postal_codes" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_postal_codes_id_seq'::regclass),
    "colony_id" INTEGER NOT NULL,
    "postal_code" CHARACTER VARYING NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_cat_postal_codes_colony" FOREIGN KEY ("colony_id") REFERENCES "public"."cat_colonies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "public"."cat_role_activities" (
    "id" INTEGER NOT NULL DEFAULT nextval('cat_role_activities_id_seq'::regclass),
    "role_id" INTEGER NOT NULL,
    "code" CHARACTER VARYING NOT NULL,
    "activity" CHARACTER VARYING NOT NULL,
    "description" CHARACTER VARYING,
    PRIMARY KEY ("id"),
    UNIQUE ("code"),
    CONSTRAINT "fk_cat_role_activities_role" FOREIGN KEY ("role_id") REFERENCES "public"."cat_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================================
-- 2. PERSON AND USER TABLES
-- ============================================================================

CREATE TABLE "public"."persons" (
    "id" CHARACTER VARYING NOT NULL,
    "first_name_id" INTEGER NOT NULL,
    "last_name_id" INTEGER NOT NULL,
    "gender" CHARACTER VARYING,
    "phone" CHARACTER VARYING,
    "registration_date" DATE NOT NULL,
    "image_path" CHARACTER VARYING,
    "street_id" INTEGER,
    "colony_id" INTEGER,
    "municipality_id" INTEGER,
    "state_id" INTEGER,
    "postal_code_id" INTEGER,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_persons_first_name" FOREIGN KEY ("first_name_id") REFERENCES "public"."cat_first_names"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_persons_last_name" FOREIGN KEY ("last_name_id") REFERENCES "public"."cat_last_names"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_persons_street" FOREIGN KEY ("street_id") REFERENCES "public"."cat_streets"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_persons_colony" FOREIGN KEY ("colony_id") REFERENCES "public"."cat_colonies"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_persons_municipality" FOREIGN KEY ("municipality_id") REFERENCES "public"."cat_municipalities"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_persons_state" FOREIGN KEY ("state_id") REFERENCES "public"."cat_states"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_persons_postal_code" FOREIGN KEY ("postal_code_id") REFERENCES "public"."cat_postal_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "public"."users" (
    "id" CHARACTER VARYING NOT NULL,
    "person_id" CHARACTER VARYING NOT NULL,
    "email" CHARACTER VARYING NOT NULL,
    "password_hash" CHARACTER VARYING NOT NULL,
    "active" BOOLEAN NOT NULL,
    "student_id" CHARACTER VARYING,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("email"),
    CONSTRAINT "fk_users_person" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "public"."user_roles" (
    "user_id" CHARACTER VARYING NOT NULL,
    "role_id" INTEGER NOT NULL,
    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "fk_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "public"."cat_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================================
-- 3. COURSE TABLES
-- ============================================================================

CREATE TABLE "public"."courses" (
    "id" CHARACTER VARYING NOT NULL,
    "code" CHARACTER VARYING NOT NULL,
    "name" CHARACTER VARYING NOT NULL,
    "description" TEXT,
    "url_image" CHARACTER VARYING,
    "grade" CHARACTER VARYING,
    "group_name" CHARACTER VARYING,
    "teacher_id" CHARACTER VARYING NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("code"),
    CONSTRAINT "fk_courses_teacher" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "public"."course_units" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "name" CHARACTER VARYING NOT NULL,
    "url_image" CHARACTER VARYING,
    "num_unity" INTEGER NOT NULL,
    "description" TEXT,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_course_units_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 4. ENROLLMENT AND GRADING TABLES
-- ============================================================================

CREATE TABLE "public"."enrollments" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "student_id" CHARACTER VARYING NOT NULL,
    "enrollment_date" DATE NOT NULL,
    "status" CHARACTER VARYING NOT NULL,
    "final_grade_value" NUMERIC,
    "final_grade_max_score" NUMERIC,
    PRIMARY KEY ("id"),
    UNIQUE ("course_id", "student_id"),
    CONSTRAINT "fk_enrollments_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_enrollments_student" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."gradebooks" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "student_id" CHARACTER VARYING NOT NULL,
    "calculated_total_value" NUMERIC,
    "final_grade_value" NUMERIC,
    "final_feedback" TEXT,
    "last_calculated" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("course_id", "student_id"),
    CONSTRAINT "fk_gradebooks_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_gradebooks_student" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."unit_grades" (
    "id" CHARACTER VARYING NOT NULL,
    "unit_id" CHARACTER VARYING NOT NULL,
    "student_id" CHARACTER VARYING NOT NULL,
    "calculated_total_value" NUMERIC,
    "final_grade_value" NUMERIC,
    "final_feedback" TEXT,
    "assignment_grades_json" TEXT,
    "quiz_grades_json" TEXT,
    "last_calculated" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("unit_id", "student_id"),
    CONSTRAINT "fk_unit_grades_unit" FOREIGN KEY ("unit_id") REFERENCES "public"."course_units"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_unit_grades_student" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 5. PAGES TABLE
-- ============================================================================

CREATE TABLE "public"."pages" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "unit_id" CHARACTER VARYING NOT NULL,
    "title" CHARACTER VARYING NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "last_modified" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "published" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_pages_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_pages_unit" FOREIGN KEY ("unit_id") REFERENCES "public"."course_units"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."page_external_links" (
    "page_id" CHARACTER VARYING NOT NULL,
    "url" CHARACTER VARYING,
    PRIMARY KEY ("page_id"),
    CONSTRAINT "fk_page_external_links_page" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 6. ASSIGNMENTS AND SUBMISSIONS
-- ============================================================================

CREATE TABLE "public"."assignments" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "unit_id" CHARACTER VARYING,
    "title" CHARACTER VARYING NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "due_date" TIMESTAMP WITHOUT TIME ZONE,
    "max_points" INTEGER NOT NULL,
    "instructions" TEXT,
    "active" BOOLEAN NOT NULL,
    "submission_format" CHARACTER VARYING NOT NULL DEFAULT 'DIGITAL',
    "target_type" CHARACTER VARYING NOT NULL DEFAULT 'INDIVIDUAL',
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_assignments_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_assignments_unit" FOREIGN KEY ("unit_id") REFERENCES "public"."course_units"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "public"."assignment_links" (
    "id" CHARACTER VARYING NOT NULL DEFAULT (gen_random_uuid())::text,
    "assignment_id" CHARACTER VARYING NOT NULL,
    "link_url" CHARACTER VARYING NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_assignment_links_assignment" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."submissions" (
    "id" CHARACTER VARYING NOT NULL,
    "assignment_id" CHARACTER VARYING NOT NULL,
    "student_id" CHARACTER VARYING NOT NULL,
    "team_id" CHARACTER VARYING,
    "content" TEXT NOT NULL,
    "submitted_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "status" CHARACTER VARYING NOT NULL,
    "grade_value" NUMERIC,
    "grade_max_score" NUMERIC,
    "teacher_feedback" TEXT,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_submissions_assignment" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_submissions_student" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 7. QUIZZES
-- ============================================================================

CREATE TABLE "public"."quizzes" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "unit_id" CHARACTER VARYING,
    "title" CHARACTER VARYING NOT NULL,
    "description" TEXT,
    "available_from" TIMESTAMP WITHOUT TIME ZONE,
    "available_until" TIMESTAMP WITHOUT TIME ZONE,
    "time_limit_minutes" INTEGER,
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT false,
    "show_correct_answers" BOOLEAN NOT NULL DEFAULT true,
    "allow_see_results" BOOLEAN NOT NULL DEFAULT false,
    "total_score" NUMERIC NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_quizzes_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_quizzes_unit" FOREIGN KEY ("unit_id") REFERENCES "public"."course_units"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "public"."quiz_questions" (
    "id" CHARACTER VARYING NOT NULL,
    "quiz_id" CHARACTER VARYING NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" CHARACTER VARYING NOT NULL,
    "points" INTEGER NOT NULL,
    "options_json" TEXT,
    "correct_answer" TEXT,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_quiz_questions_quiz" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."quiz_submissions" (
    "id" CHARACTER VARYING NOT NULL,
    "quiz_id" CHARACTER VARYING NOT NULL,
    "student_id" CHARACTER VARYING NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "started_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "submitted_at" TIMESTAMP WITHOUT TIME ZONE,
    "status" CHARACTER VARYING NOT NULL,
    "answers_json" TEXT,
    "grade_value" NUMERIC,
    "grade_max_score" NUMERIC,
    "final_grade" NUMERIC,
    "can_view_results" BOOLEAN NOT NULL DEFAULT false,
    "auto_graded" BOOLEAN NOT NULL,
    "question_grades_json" TEXT,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_quiz_submissions_quiz" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_quiz_submissions_student" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 8. STUDENT GROUPS
-- ============================================================================

CREATE TABLE "public"."student_groups" (
    "id" CHARACTER VARYING NOT NULL,
    "course_id" CHARACTER VARYING NOT NULL,
    "name" CHARACTER VARYING NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "active" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_student_groups_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."group_members" (
    "group_id" CHARACTER VARYING NOT NULL,
    "student_id" CHARACTER VARYING,
    PRIMARY KEY ("group_id"),
    CONSTRAINT "fk_group_members_group" FOREIGN KEY ("group_id") REFERENCES "public"."student_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_group_members_student" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- 9. DOCUMENTS
-- ============================================================================

CREATE TABLE "public"."documents" (
    "id" CHARACTER VARYING NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" CHARACTER VARYING NOT NULL,
    "storage_path" CHARACTER VARYING NOT NULL,
    "assignment_id" CHARACTER VARYING,
    "submission_id" CHARACTER VARYING,
    "page_id" CHARACTER VARYING,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_documents_assignment" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_documents_submission" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_documents_page" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- 10. ANALYSIS REQUESTS
-- ============================================================================

CREATE TABLE "public"."analysis_requests" (
    "id" CHARACTER VARYING NOT NULL,
    "submission_id" CHARACTER VARYING NOT NULL,
    "content" TEXT NOT NULL,
    "status" CHARACTER VARYING NOT NULL,
    "probability" NUMERIC,
    "model_used" CHARACTER VARYING,
    "confidence_level" CHARACTER VARYING,
    "detected_segments_json" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "analyzed_at" TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY ("id"),
    CONSTRAINT "fk_analysis_requests_submission" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Analysis Requests Indexes
CREATE INDEX "idx_analysis_submission" ON "public"."analysis_requests" USING btree ("submission_id");
CREATE INDEX "idx_analysis_status" ON "public"."analysis_requests" USING btree ("status");
CREATE INDEX "idx_analysis_probability" ON "public"."analysis_requests" USING btree ("probability");

-- Assignment Links Indexes
CREATE INDEX "idx_assignment_link_assignment" ON "public"."assignment_links" USING btree ("assignment_id");

-- Assignments Indexes
CREATE INDEX "idx_assignment_course" ON "public"."assignments" USING btree ("course_id");
CREATE INDEX "idx_assignment_unit" ON "public"."assignments" USING btree ("unit_id");
CREATE INDEX "idx_assignment_due_date" ON "public"."assignments" USING btree ("due_date");
CREATE INDEX "idx_assignment_target_type" ON "public"."assignments" USING btree ("target_type");
CREATE INDEX "idx_submission_format" ON "public"."assignments" USING btree ("submission_format");

-- Documents Indexes
CREATE INDEX "idx_document_assignment" ON "public"."documents" USING btree ("assignment_id");
CREATE INDEX "idx_document_submission" ON "public"."documents" USING btree ("submission_id");
CREATE INDEX "idx_document_page" ON "public"."documents" USING btree ("page_id");

-- Course Units Indexes
CREATE INDEX "idx_unit_course" ON "public"."course_units" USING btree ("course_id");
CREATE INDEX "idx_unit_number" ON "public"."course_units" USING btree ("num_unity");

-- Courses Indexes
CREATE INDEX "idx_course_teacher" ON "public"."courses" USING btree ("teacher_id");

-- Enrollments Indexes
CREATE INDEX "idx_enrollment_course" ON "public"."enrollments" USING btree ("course_id");
CREATE INDEX "idx_enrollment_student" ON "public"."enrollments" USING btree ("student_id");
CREATE INDEX "idx_enrollment_status" ON "public"."enrollments" USING btree ("status");

-- Gradebooks Indexes
CREATE INDEX "idx_gradebook_course" ON "public"."gradebooks" USING btree ("course_id");
CREATE INDEX "idx_gradebook_student" ON "public"."gradebooks" USING btree ("student_id");

-- Pages Indexes
CREATE INDEX "idx_page_course" ON "public"."pages" USING btree ("course_id");
CREATE INDEX "idx_page_unit" ON "public"."pages" USING btree ("unit_id");
CREATE INDEX "idx_page_published" ON "public"."pages" USING btree ("published");

-- Quiz Questions Indexes
CREATE INDEX "idx_quiz_question_quiz" ON "public"."quiz_questions" USING btree ("quiz_id");

-- Quiz Submissions Indexes
CREATE INDEX "idx_qsubm_quiz" ON "public"."quiz_submissions" USING btree ("quiz_id");
CREATE INDEX "idx_qsubm_student" ON "public"."quiz_submissions" USING btree ("student_id");
CREATE INDEX "idx_qsubm_status" ON "public"."quiz_submissions" USING btree ("status");

-- Quizzes Indexes
CREATE INDEX "idx_quiz_course" ON "public"."quizzes" USING btree ("course_id");
CREATE INDEX "idx_quiz_unit" ON "public"."quizzes" USING btree ("unit_id");
CREATE INDEX "idx_quiz_active" ON "public"."quizzes" USING btree ("active");

-- Student Groups Indexes
CREATE INDEX "idx_group_course" ON "public"."student_groups" USING btree ("course_id");
CREATE INDEX "idx_group_active" ON "public"."student_groups" USING btree ("active");

-- Submissions Indexes
CREATE INDEX "idx_submission_assignment" ON "public"."submissions" USING btree ("assignment_id");
CREATE INDEX "idx_submission_student" ON "public"."submissions" USING btree ("student_id");
CREATE INDEX "idx_submission_team" ON "public"."submissions" USING btree ("team_id");
CREATE INDEX "idx_submission_status" ON "public"."submissions" USING btree ("status");

-- Unit Grades Indexes
CREATE INDEX "idx_ugrade_unit" ON "public"."unit_grades" USING btree ("unit_id");
CREATE INDEX "idx_ugrade_student" ON "public"."unit_grades" USING btree ("student_id");

-- Users Indexes
CREATE INDEX "idx_user_person_id" ON "public"."users" USING btree ("person_id");
CREATE INDEX "idx_user_email" ON "public"."users" USING btree ("email");

-- ============================================================================
-- SCRIPT COMPLETED
-- ============================================================================
-- All tables have been created with:
-- ✓ Primary Keys
-- ✓ Foreign Key Relationships
-- ✓ Data Types and Constraints
-- ✓ Indexes
-- ✓ Defaults
-- ============================================================================


-- ============================================================================
-- SEED DATA
-- ============================================================================
INSERT INTO "public"."cat_roles" ("code", "description") VALUES
  ('ADMIN', 'Administrator'),
  ('TEACHER', 'Teacher'),
  ('STUDENT', 'Student');