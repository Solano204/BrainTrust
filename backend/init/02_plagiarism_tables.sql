-- Plagiarism detection tables
-- Run this migration after 01_schema.sql

DROP TABLE IF EXISTS "public"."plagiarism_similar_paragraphs" CASCADE;
DROP TABLE IF EXISTS "public"."plagiarism_checks" CASCADE;

CREATE TABLE "public"."plagiarism_checks" (
    "id"                      VARCHAR(50) PRIMARY KEY,
    "source_submission_id"    VARCHAR(50) NOT NULL,
    "compared_submission_id"  VARCHAR(50) NOT NULL,
    "compared_student_id"     VARCHAR(50) NOT NULL,
    "assignment_id"           VARCHAR(50) NOT NULL,
    "overall_similarity"      NUMERIC(5, 2),
    "status"                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "error_message"           TEXT,
    "checked_at"              TIMESTAMP,
    CONSTRAINT uq_plagiarism_pair UNIQUE ("source_submission_id", "compared_submission_id")
);

CREATE INDEX idx_plagiarism_source     ON "public"."plagiarism_checks" ("source_submission_id");
CREATE INDEX idx_plagiarism_assignment ON "public"."plagiarism_checks" ("assignment_id");
CREATE INDEX idx_plagiarism_compared   ON "public"."plagiarism_checks" ("compared_submission_id");

CREATE TABLE "public"."plagiarism_similar_paragraphs" (
    "id"                  BIGSERIAL PRIMARY KEY,
    "plagiarism_check_id" VARCHAR(50) NOT NULL REFERENCES "public"."plagiarism_checks"("id") ON DELETE CASCADE,
    "paragraph_index"     INTEGER NOT NULL,
    "original_text"       TEXT,
    "matched_text"        TEXT,
    "similarity"          NUMERIC(5, 2),
    CONSTRAINT fk_simpar_check FOREIGN KEY ("plagiarism_check_id")
        REFERENCES "public"."plagiarism_checks"("id") ON DELETE CASCADE
);

CREATE INDEX idx_simpar_check ON "public"."plagiarism_similar_paragraphs" ("plagiarism_check_id");
