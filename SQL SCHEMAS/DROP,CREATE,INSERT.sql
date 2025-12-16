-- Drop all tables in correct order
DROP TABLE IF EXISTS analysis_requests CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS page_external_links CASCADE;
DROP TABLE IF EXISTS quiz_submissions CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS unit_grades CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS gradebooks CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS course_units CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS persons CASCADE;

-- Drop the enum type (ONLY ONCE)
DROP TYPE IF EXISTS user_role CASCADE;

-- Recreate the enum type (ONLY ONCE)
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'SYS_MANAGER');

-- Table: persons
CREATE TABLE persons (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(20),
    registration_date DATE NOT NULL,
    image_path VARCHAR(500),
    address_street VARCHAR(255),
    address_colony VARCHAR(100),
    address_municipality VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(10)
);

-- Table: users
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    person_id VARCHAR(50) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    active BOOLEAN NOT NULL,
    student_id VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- Create indexes for users
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_person_id ON users(person_id);

-- ... rest of your table creation scripts continue normally ...
-- Table: courses
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url_image VARCHAR(500),
    grade VARCHAR(50),
    group_name VARCHAR(50),
    teacher_id VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for courses
CREATE INDEX idx_course_code ON courses(code);
CREATE INDEX idx_course_teacher ON courses(teacher_id);

-- Table: course_units
CREATE TABLE course_units (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url_image VARCHAR(500),
    num_unity INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for course_units
CREATE INDEX idx_unit_course ON course_units(course_id);
CREATE INDEX idx_unit_number ON course_units(num_unity);

-- Table: enrollments
CREATE TABLE enrollments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    final_grade_value NUMERIC(10,2),
    final_grade_max_score NUMERIC(10,2),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(course_id, student_id)
);

-- Create indexes for enrollments
CREATE INDEX idx_enrollment_course ON enrollments(course_id);
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_enrollment_status ON enrollments(status);
CREATE INDEX idx_enrollment_course_student ON enrollments(course_id, student_id);

-- Table: student_groups
CREATE TABLE student_groups (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for student_groups
CREATE INDEX idx_group_course ON student_groups(course_id);
CREATE INDEX idx_group_active ON student_groups(active);

-- Table: group_members (collection table for student_groups)
CREATE TABLE group_members (
    group_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (group_id, student_id),
    FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: assignments
CREATE TABLE assignments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    unit_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    max_points INTEGER NOT NULL,
    instructions TEXT,
    active BOOLEAN NOT NULL,
    target_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES course_units(id) ON DELETE SET NULL
);

-- Create indexes for assignments
CREATE INDEX idx_assignment_course ON assignments(course_id);
CREATE INDEX idx_assignment_unit ON assignments(unit_id);
CREATE INDEX idx_assignment_due_date ON assignments(due_date);
CREATE INDEX idx_assignment_target_type ON assignments(target_type);

-- Table: pages
CREATE TABLE pages (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    unit_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP NOT NULL,
    last_modified TIMESTAMP NOT NULL,
    published BOOLEAN NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES course_units(id) ON DELETE CASCADE
);

-- Create indexes for pages
CREATE INDEX idx_page_course ON pages(course_id);
CREATE INDEX idx_page_unit ON pages(unit_id);
CREATE INDEX idx_page_published ON pages(published);

-- Table: page_external_links (collection table for pages)
CREATE TABLE page_external_links (
    page_id VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    PRIMARY KEY (page_id, url),
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Table: quizzes
CREATE TABLE quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    unit_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    time_limit_minutes INTEGER,
    max_attempts INTEGER NOT NULL,
    shuffle_questions BOOLEAN NOT NULL,
    show_correct_answers BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES course_units(id) ON DELETE SET NULL
);

-- Create indexes for quizzes
CREATE INDEX idx_quiz_course ON quizzes(course_id);
CREATE INDEX idx_quiz_active ON quizzes(active);

-- Table: quiz_questions
CREATE TABLE quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    options_json TEXT,
    correct_answer TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Table: submissions
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50),
    content TEXT NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    grade_value NUMERIC(10,2),
    grade_max_score NUMERIC(10,2),
    teacher_feedback TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES student_groups(id) ON DELETE SET NULL
);

-- Create indexes for submissions
CREATE INDEX idx_submission_assignment ON submissions(assignment_id);
CREATE INDEX idx_submission_student ON submissions(student_id);
CREATE INDEX idx_submission_status ON submissions(status);
CREATE INDEX idx_submission_team ON submissions(team_id);
DROP TABLE IF EXISTS quiz_submissions CASCADE;

-- Table: quiz_submissions
-- In your CREATE TABLE quiz_submissions section, add the column:
CREATE TABLE quiz_submissions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    attempt_number INTEGER NOT NULL,
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    answers_json TEXT,
    grade_value NUMERIC(10,2),
    grade_max_score NUMERIC(10,2),
    auto_graded BOOLEAN NOT NULL,
    question_grades_json TEXT, -- ✅ ADD THIS COLUMN
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);


ALTER TABLE quiz_submissions ADD COLUMN question_grades_json TEXT DEFAULT '[]';
UPDATE quiz_submissions SET question_grades_json = '[]' WHERE question_grades_json IS NULL;
-- Create indexes for quiz_submissions
CREATE INDEX idx_qsubm_quiz ON quiz_submissions(quiz_id);
CREATE INDEX idx_qsubm_student ON quiz_submissions(student_id);
CREATE INDEX idx_qsubm_status ON quiz_submissions(status);

-- Table: documents
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    assignment_id VARCHAR(50),
    submission_id VARCHAR(50),
    page_id VARCHAR(50),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    CHECK (
        (assignment_id IS NOT NULL AND submission_id IS NULL AND page_id IS NULL) OR
        (assignment_id IS NULL AND submission_id IS NOT NULL AND page_id IS NULL) OR
        (assignment_id IS NULL AND submission_id IS NULL AND page_id IS NOT NULL)
    )
);

-- Create indexes for documents
CREATE INDEX idx_document_assignment ON documents(assignment_id);
CREATE INDEX idx_document_submission ON documents(submission_id);
CREATE INDEX idx_document_page ON documents(page_id);

-- Table: gradebooks
CREATE TABLE gradebooks (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    calculated_total_value NUMERIC(10,2),
    final_grade_value NUMERIC(10,2),
    final_feedback TEXT,
    last_calculated TIMESTAMP NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(course_id, student_id)
);

-- Create indexes for gradebooks
CREATE INDEX idx_gradebook_course ON gradebooks(course_id);
CREATE INDEX idx_gradebook_student ON gradebooks(student_id);
CREATE INDEX idx_gradebook_course_student ON gradebooks(course_id, student_id);

-- Table: unit_grades
CREATE TABLE unit_grades (
    id VARCHAR(50) PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    calculated_total_value NUMERIC(10,2),
    final_grade_value NUMERIC(10,2),
    final_feedback TEXT,
    assignment_grades_json TEXT,
    quiz_grades_json TEXT,
    last_calculated TIMESTAMP NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES course_units(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for unit_grades
CREATE INDEX idx_ugrade_unit ON unit_grades(unit_id);
CREATE INDEX idx_ugrade_student ON unit_grades(student_id);
CREATE INDEX idx_ugrade_unit_student ON unit_grades(unit_id, student_id);

-- Table: analysis_requests
CREATE TABLE analysis_requests (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    probability NUMERIC(10,4),
    model_used VARCHAR(50),
    confidence_level VARCHAR(20),
    detected_segments_json JSONB,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL,
    analyzed_at TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Create indexes for analysis_requests
CREATE INDEX idx_analysis_submission ON analysis_requests(submission_id);
CREATE INDEX idx_analysis_status ON analysis_requests(status);
CREATE INDEX idx_analysis_probability ON analysis_requests(probability);

-- 1. Create the table 'analysis_requests'
CREATE TABLE IF NOT EXISTS analysis_requests (
    id                 VARCHAR(50) NOT NULL,
    submission_id      VARCHAR(50) NOT NULL,
    content            TEXT NOT NULL,
    status             VARCHAR(20) NOT NULL,
    probability        NUMERIC(10, 4),
    model_used         VARCHAR(50),
    confidence_level   VARCHAR(20),
    detected_segments  JSONB,
    error_message      TEXT,
    created_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    analyzed_at        TIMESTAMP WITHOUT TIME ZONE,

    -- Primary Key Constraint
    CONSTRAINT pk_analysis_requests PRIMARY KEY (id)
);








ALTER TABLE users ALTER COLUMN role TYPE TEXT;

-- Drop the old table if exists
DROP TABLE IF EXISTS assignment_links;

-- Create the new table with proper structure
CREATE TABLE assignment_links (
    id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50) NOT NULL,
    link_url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_links_assignment 
        FOREIGN KEY (assignment_id) 
        REFERENCES assignments(id) 
        ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_assignment_links_assignment ON assignment_links(assignment_id);
CREATE INDEX idx_assignment_links_url ON assignment_links(link_url);

ALTER TABLE assignments 
ADD COLUMN submission_format VARCHAR(20) NOT NULL DEFAULT 'DIGITAL';

-- Add an index for better query performance
CREATE INDEX idx_assignment_submission_format ON assignments(submission_format);
-- Insert sample data for persons (20 records)
INSERT INTO persons (id, first_name, last_name, gender, phone, registration_date, image_path, address_street, address_colony, address_municipality, address_state, address_postal_code) VALUES
('person_001', 'John', 'Smith', 'Male', '555-0101', '2023-01-15', '/images/john.jpg', '123 Main St', 'Downtown', 'Springfield', 'Illinois', '62701'),
('person_002', 'Maria', 'Garcia', 'Female', '555-0102', '2023-01-16', '/images/maria.jpg', '456 Oak Ave', 'Northside', 'Springfield', 'Illinois', '62702'),
('person_003', 'David', 'Johnson', 'Male', '555-0103', '2023-01-17', '/images/david.jpg', '789 Pine Rd', 'South End', 'Springfield', 'Illinois', '62703'),
('person_004', 'Sarah', 'Williams', 'Female', '555-0104', '2023-01-18', '/images/sarah.jpg', '321 Elm St', 'Eastwood', 'Springfield', 'Illinois', '62704'),
('person_005', 'Michael', 'Brown', 'Male', '555-0105', '2023-01-19', '/images/michael.jpg', '654 Maple Dr', 'Westside', 'Springfield', 'Illinois', '62705'),
('person_006', 'Jennifer', 'Davis', 'Female', '555-0106', '2023-01-20', '/images/jennifer.jpg', '987 Cedar Ln', 'Central', 'Springfield', 'Illinois', '62706'),
('person_007', 'Robert', 'Miller', 'Male', '555-0107', '2023-01-21', '/images/robert.jpg', '159 Birch St', 'Hillside', 'Springfield', 'Illinois', '62707'),
('person_008', 'Lisa', 'Wilson', 'Female', '555-0108', '2023-01-22', '/images/lisa.jpg', '753 Spruce Ave', 'Riverside', 'Springfield', 'Illinois', '62708'),
('person_009', 'James', 'Taylor', 'Male', '555-0109', '2023-01-23', '/images/james.jpg', '246 Willow Way', 'Parkview', 'Springfield', 'Illinois', '62709'),
('person_010', 'Karen', 'Anderson', 'Female', '555-0110', '2023-01-24', '/images/karen.jpg', '864 Poplar Blvd', 'Lakeview', 'Springfield', 'Illinois', '62710'),
('person_011', 'Thomas', 'Thomas', 'Male', '555-0111', '2023-01-25', '/images/thomas.jpg', '975 Magnolia St', 'Highland', 'Springfield', 'Illinois', '62711'),
('person_012', 'Nancy', 'Jackson', 'Female', '555-0112', '2023-01-26', '/images/nancy.jpg', '135 Redwood Rd', 'Meadows', 'Springfield', 'Illinois', '62712'),
('person_013', 'Daniel', 'White', 'Male', '555-0113', '2023-01-27', '/images/daniel.jpg', '579 Sycamore Ln', 'Forest Hills', 'Springfield', 'Illinois', '62713'),
('person_014', 'Susan', 'Harris', 'Female', '555-0114', '2023-01-28', '/images/susan.jpg', '792 Aspen Ct', 'Mountain View', 'Springfield', 'Illinois', '62714'),
('person_015', 'Paul', 'Martin', 'Male', '555-0115', '2023-01-29', '/images/paul.jpg', '618 Chestnut St', 'Valley Stream', 'Springfield', 'Illinois', '62715'),
('person_016', 'Betty', 'Thompson', 'Female', '555-0116', '2023-01-30', '/images/betty.jpg', '354 Walnut Ave', 'Sunset', 'Springfield', 'Illinois', '62716'),
('person_017', 'Kevin', 'Garcia', 'Male', '555-0117', '2023-01-31', '/images/kevin.jpg', '486 Hickory Dr', 'Spring Valley', 'Springfield', 'Illinois', '62717'),
('person_018', 'Helen', 'Martinez', 'Female', '555-0118', '2023-02-01', '/images/helen.jpg', '627 Locust St', 'Greenfield', 'Springfield', 'Illinois', '62718'),
('person_019', 'Steven', 'Robinson', 'Male', '555-0119', '2023-02-02', '/images/steven.jpg', '739 Palm Blvd', 'Oakwood', 'Springfield', 'Illinois', '62719'),
('person_020', 'Amanda', 'Clark', 'Female', '555-0120', '2023-02-03', '/images/amanda.jpg', '851 Olive Way', 'Pinecrest', 'Springfield', 'Illinois', '62720');

-- Insert sample data for users (20 records)
INSERT INTO users (id, person_id, email, password_hash, role, active, student_id, created_at) VALUES
('user_001', 'person_001', 'john.smith@school.edu', 'hash001', 'TEACHER', true, NULL, '2023-01-15 09:00:00'),
('user_002', 'person_002', 'maria.garcia@school.edu', 'hash002', 'STUDENT', true, 'STU001', '2023-01-16 09:00:00'),
('user_003', 'person_003', 'david.johnson@school.edu', 'hash003', 'STUDENT', true, 'STU002', '2023-01-17 09:00:00'),
('user_004', 'person_004', 'sarah.williams@school.edu', 'hash004', 'STUDENT', true, 'STU003', '2023-01-18 09:00:00'),
('user_005', 'person_005', 'michael.brown@school.edu', 'hash005', 'STUDENT', true, 'STU004', '2023-01-19 09:00:00'),
('user_006', 'person_006', 'jennifer.davis@school.edu', 'hash006', 'STUDENT', true, 'STU005', '2023-01-20 09:00:00'),
('user_007', 'person_007', 'robert.miller@school.edu', 'hash007', 'STUDENT', true, 'STU006', '2023-01-21 09:00:00'),
('user_008', 'person_008', 'lisa.wilson@school.edu', 'hash008', 'STUDENT', true, 'STU007', '2023-01-22 09:00:00'),
('user_009', 'person_009', 'james.taylor@school.edu', 'hash009', 'STUDENT', true, 'STU008', '2023-01-23 09:00:00'),
('user_010', 'person_010', 'karen.anderson@school.edu', 'hash010', 'STUDENT', true, 'STU009', '2023-01-24 09:00:00'),
('user_011', 'person_011', 'thomas.thomas@school.edu', 'hash011', 'STUDENT', true, 'STU010', '2023-01-25 09:00:00'),
('user_012', 'person_012', 'nancy.jackson@school.edu', 'hash012', 'STUDENT', true, 'STU011', '2023-01-26 09:00:00'),
('user_013', 'person_013', 'daniel.white@school.edu', 'hash013', 'STUDENT', true, 'STU012', '2023-01-27 09:00:00'),
('user_014', 'person_014', 'susan.harris@school.edu', 'hash014', 'STUDENT', true, 'STU013', '2023-01-28 09:00:00'),
('user_015', 'person_015', 'paul.martin@school.edu', 'hash015', 'STUDENT', true, 'STU014', '2023-01-29 09:00:00'),
('user_016', 'person_016', 'betty.thompson@school.edu', 'hash016', 'STUDENT', true, 'STU015', '2023-01-30 09:00:00'),
('user_017', 'person_017', 'kevin.garcia@school.edu', 'hash017', 'STUDENT', true, 'STU016', '2023-01-31 09:00:00'),
('user_018', 'person_018', 'helen.martinez@school.edu', 'hash018', 'STUDENT', true, 'STU017', '2023-02-01 09:00:00'),
('user_019', 'person_019', 'steven.robinson@school.edu', 'hash019', 'STUDENT', true, 'STU018', '2023-02-02 09:00:00'),
('user_020', 'person_020', 'amanda.clark@school.edu', 'hash020', 'ADMIN', true, NULL, '2023-02-03 09:00:00');

-- Insert sample data for courses (20 records)
INSERT INTO courses (id, code, name, description, url_image, grade, group_name, teacher_id, active, created_at) VALUES
('course_001', 'MATH101', 'Introduction to Mathematics', 'Basic mathematics course covering algebra and geometry', '/images/math101.jpg', 'Freshman', 'Group A', 'user_001', true, '2023-02-01 10:00:00'),
('course_002', 'SCI201', 'General Science', 'Comprehensive science course for beginners', '/images/sci201.jpg', 'Sophomore', 'Group B', 'user_001', true, '2023-02-02 10:00:00'),
('course_003', 'ENG101', 'English Composition', 'Fundamentals of English writing and grammar', '/images/eng101.jpg', 'Freshman', 'Group A', 'user_001', true, '2023-02-03 10:00:00'),
('course_004', 'HIST301', 'World History', 'Survey of world civilizations', '/images/hist301.jpg', 'Junior', 'Group C', 'user_001', true, '2023-02-04 10:00:00'),
('course_005', 'BIO202', 'Biology Fundamentals', 'Introduction to biological sciences', '/images/bio202.jpg', 'Sophomore', 'Group B', 'user_001', true, '2023-02-05 10:00:00'),
('course_006', 'CHEM301', 'Chemistry Principles', 'Basic principles of chemistry', '/images/chem301.jpg', 'Junior', 'Group C', 'user_001', true, '2023-02-06 10:00:00'),
('course_007', 'PHYS401', 'Physics Advanced', 'Advanced physics concepts', '/images/phys401.jpg', 'Senior', 'Group D', 'user_001', true, '2023-02-07 10:00:00'),
('course_008', 'ART101', 'Art Appreciation', 'Introduction to visual arts', '/images/art101.jpg', 'Freshman', 'Group A', 'user_001', true, '2023-02-08 10:00:00'),
('course_009', 'MUS201', 'Music Theory', 'Fundamentals of music composition', '/images/mus201.jpg', 'Sophomore', 'Group B', 'user_001', true, '2023-02-09 10:00:00'),
('course_010', 'CS101', 'Computer Science Basics', 'Introduction to programming', '/images/cs101.jpg', 'Freshman', 'Group A', 'user_001', true, '2023-02-10 10:00:00'),
('course_011', 'PSY301', 'Psychology Intro', 'Basic psychological principles', '/images/psy301.jpg', 'Junior', 'Group C', 'user_001', true, '2023-02-11 10:00:00'),
('course_012', 'SOC201', 'Sociology Fundamentals', 'Study of human society', '/images/soc201.jpg', 'Sophomore', 'Group B', 'user_001', true, '2023-02-12 10:00:00'),
('course_013', 'ECON401', 'Economics Advanced', 'Advanced economic theory', '/images/econ401.jpg', 'Senior', 'Group D', 'user_001', true, '2023-02-13 10:00:00'),
('course_014', 'PHIL101', 'Philosophy Intro', 'Introduction to philosophical thought', '/images/phil101.jpg', 'Freshman', 'Group A', 'user_001', true, '2023-02-14 10:00:00'),
('course_015', 'GEO201', 'Geography World', 'World geography and cultures', '/images/geo201.jpg', 'Sophomore', 'Group B', 'user_001', true, '2023-02-15 10:00:00'),
('course_016', 'BUS301', 'Business Principles', 'Fundamentals of business', '/images/bus301.jpg', 'Junior', 'Group C', 'user_001', true, '2023-02-16 10:00:00'),
('course_017', 'LAW401', 'Legal Studies', 'Introduction to law', '/images/law401.jpg', 'Senior', 'Group D', 'user_001', true, '2023-02-17 10:00:00'),
('course_018', 'MED501', 'Medical Basics', 'Basic medical terminology', '/images/med501.jpg', 'Graduate', 'Group E', 'user_001', true, '2023-02-18 10:00:00'),
('course_019', 'ENG201', 'Advanced English', 'Advanced writing and literature', '/images/eng201.jpg', 'Sophomore', 'Group B', 'user_001', true, '2023-02-19 10:00:00'),
('course_020', 'MATH301', 'Advanced Mathematics', 'Calculus and advanced topics', '/images/math301.jpg', 'Junior', 'Group C', 'user_001', true, '2023-02-20 10:00:00');

-- Insert sample data for course_units (20 records)
INSERT INTO course_units (id, course_id, name, url_image, num_unity, description) VALUES
('unit_001', 'course_001', 'Algebra Basics', '/images/unit1.jpg', 1, 'Introduction to algebraic expressions'),
('unit_002', 'course_001', 'Geometry Fundamentals', '/images/unit2.jpg', 2, 'Basic geometric shapes and theorems'),
('unit_003', 'course_002', 'Scientific Method', '/images/unit3.jpg', 1, 'Understanding the scientific process'),
('unit_004', 'course_002', 'Biology Basics', '/images/unit4.jpg', 2, 'Introduction to living organisms'),
('unit_005', 'course_003', 'Grammar Essentials', '/images/unit5.jpg', 1, 'Fundamental grammar rules'),
('unit_006', 'course_003', 'Writing Techniques', '/images/unit6.jpg', 2, 'Effective writing strategies'),
('unit_007', 'course_004', 'Ancient Civilizations', '/images/unit7.jpg', 1, 'Study of early human societies'),
('unit_008', 'course_004', 'Medieval Period', '/images/unit8.jpg', 2, 'European middle ages'),
('unit_009', 'course_005', 'Cell Biology', '/images/unit9.jpg', 1, 'Cellular structure and function'),
('unit_010', 'course_005', 'Genetics', '/images/unit10.jpg', 2, 'Principles of heredity'),
('unit_011', 'course_006', 'Atomic Structure', '/images/unit11.jpg', 1, 'Fundamentals of atoms'),
('unit_012', 'course_006', 'Chemical Reactions', '/images/unit12.jpg', 2, 'Types of chemical changes'),
('unit_013', 'course_007', 'Mechanics', '/images/unit13.jpg', 1, 'Laws of motion'),
('unit_014', 'course_007', 'Thermodynamics', '/images/unit14.jpg', 2, 'Heat and energy transfer'),
('unit_015', 'course_008', 'Art History', '/images/unit15.jpg', 1, 'Historical art movements'),
('unit_016', 'course_008', 'Color Theory', '/images/unit16.jpg', 2, 'Principles of color'),
('unit_017', 'course_009', 'Music Notation', '/images/unit17.jpg', 1, 'Reading and writing music'),
('unit_018', 'course_009', 'Harmony', '/images/unit18.jpg', 2, 'Musical chord structures'),
('unit_019', 'course_010', 'Programming Basics', '/images/unit19.jpg', 1, 'Introduction to coding'),
('unit_020', 'course_010', 'Data Structures', '/images/unit20.jpg', 2, 'Basic data organization');

-- Insert sample data for enrollments (20 records)
INSERT INTO enrollments (id, course_id, student_id, enrollment_date, status, final_grade_value, final_grade_max_score) VALUES
('enroll_001', 'course_001', 'user_002', '2023-02-01', 'ACTIVE', 85.5, 100.0),
('enroll_002', 'course_001', 'user_003', '2023-02-01', 'ACTIVE', 92.0, 100.0),
('enroll_003', 'course_001', 'user_004', '2023-02-01', 'ACTIVE', 78.0, 100.0),
('enroll_004', 'course_002', 'user_005', '2023-02-02', 'ACTIVE', 88.5, 100.0),
('enroll_005', 'course_002', 'user_006', '2023-02-02', 'ACTIVE', 95.0, 100.0),
('enroll_006', 'course_003', 'user_007', '2023-02-03', 'ACTIVE', 82.0, 100.0),
('enroll_007', 'course_003', 'user_008', '2023-02-03', 'ACTIVE', 90.5, 100.0),
('enroll_008', 'course_004', 'user_009', '2023-02-04', 'ACTIVE', 87.0, 100.0),
('enroll_009', 'course_004', 'user_010', '2023-02-04', 'ACTIVE', 93.5, 100.0),
('enroll_010', 'course_005', 'user_011', '2023-02-05', 'ACTIVE', 79.0, 100.0),
('enroll_011', 'course_005', 'user_012', '2023-02-05', 'ACTIVE', 86.5, 100.0),
('enroll_012', 'course_006', 'user_013', '2023-02-06', 'ACTIVE', 91.0, 100.0),
('enroll_013', 'course_006', 'user_014', '2023-02-06', 'ACTIVE', 84.5, 100.0),
('enroll_014', 'course_007', 'user_015', '2023-02-07', 'ACTIVE', 89.0, 100.0),
('enroll_015', 'course_007', 'user_016', '2023-02-07', 'ACTIVE', 94.5, 100.0),
('enroll_016', 'course_008', 'user_017', '2023-02-08', 'ACTIVE', 81.0, 100.0),
('enroll_017', 'course_008', 'user_018', '2023-02-08', 'ACTIVE', 88.5, 100.0),
('enroll_018', 'course_009', 'user_019', '2023-02-09', 'ACTIVE', 92.0, 100.0),
('enroll_019', 'course_009', 'user_002', '2023-02-09', 'ACTIVE', 85.5, 100.0),
('enroll_020', 'course_010', 'user_003', '2023-02-10', 'ACTIVE', 90.0, 100.0);

-- Insert sample data for student_groups (20 records)

INSERT INTO student_groups (id, course_id, name, description, created_at, active) VALUES
('group_001', 'course_001', 'Math Team A', 'Advanced mathematics study group', '2023-02-15 14:00:00', true),
('group_002', 'course_001', 'Math Team B', 'Beginner mathematics support', '2023-02-15 14:30:00', true),
('group_003', 'course_002', 'Science Club', 'Science project collaboration', '2023-02-16 14:00:00', true),
('group_004', 'course_002', 'Lab Partners', 'Laboratory work team', '2023-02-16 14:30:00', true),
('group_005', 'course_003', 'Writing Circle', 'Creative writing group', '2023-02-17 14:00:00', true),
('group_006', 'course_003', 'Grammar Masters', 'Grammar practice team', '2023-02-17 14:30:00', true),
('group_007', 'course_004', 'History Buffs', 'Historical research group', '2023-02-18 14:00:00', true),
('group_008', 'course_004', 'Archaeology Team', 'Ancient studies group', '2023-02-18 14:30:00', true),
('group_009', 'course_005', 'Biology Lab', 'Biological research team', '2023-02-19 14:00:00', true),
('group_010', 'course_005', 'Genetics Study', 'Genetics research group', '2023-02-19 14:30:00', true),
('group_011', 'course_006', 'Chemistry Lab', 'Chemical experiments team', '2023-02-20 14:00:00', true),
('group_012', 'course_006', 'Reaction Masters', 'Chemical reactions study', '2023-02-20 14:30:00', true),
('group_013', 'course_007', 'Physics Club', 'Physics problem solving', '2023-02-21 14:00:00', true),
('group_014', 'course_007', 'Mechanics Team', 'Mechanical physics group', '2023-02-21 14:30:00', true),
('group_015', 'course_008', 'Art Studio', 'Art creation team', '2023-02-22 14:00:00', true),
('group_016', 'course_008', 'Design Team', 'Graphic design group', '2023-02-22 14:30:00', true),
('group_017', 'course_009', 'Music Ensemble', 'Music performance group', '2023-02-23 14:00:00', true),
('group_018', 'course_009', 'Composition Team', 'Music composition group', '2023-02-23 14:30:00', true),
('group_019', 'course_010', 'Coding Club', 'Programming projects team', '2023-02-24 14:00:00', true),
('group_020', 'course_010', 'Algorithms Team', 'Algorithm study group', '2023-02-24 14:30:00', true);

-- Insert sample data for group_members (multiple records per group)
INSERT INTO group_members (group_id, student_id) VALUES
('group_001', 'user_002'), ('group_001', 'user_003'),
('group_002', 'user_004'), ('group_002', 'user_005'),
('group_003', 'user_006'), ('group_003', 'user_007'),
('group_004', 'user_008'), ('group_004', 'user_009'),
('group_005', 'user_010'), ('group_005', 'user_011'),
('group_006', 'user_012'), ('group_006', 'user_013'),
('group_007', 'user_014'), ('group_007', 'user_015'),
('group_008', 'user_016'), ('group_008', 'user_017'),
('group_009', 'user_018'), ('group_009', 'user_019'),
('group_010', 'user_002'), ('group_010', 'user_003'),
('group_011', 'user_004'), ('group_011', 'user_005'),
('group_012', 'user_006'), ('group_012', 'user_007'),
('group_013', 'user_008'), ('group_013', 'user_009'),
('group_014', 'user_010'), ('group_014', 'user_011'),
('group_015', 'user_012'), ('group_015', 'user_013'),
('group_016', 'user_014'), ('group_016', 'user_015'),
('group_017', 'user_016'), ('group_017', 'user_017'),
('group_018', 'user_018'), ('group_018', 'user_019'),
('group_019', 'user_002'), ('group_019', 'user_003'),
('group_020', 'user_004'), ('group_020', 'user_005');

-- Insert sample data for assignments (20 records)
INSERT INTO assignments (id, course_id, unit_id, title, description, created_at, due_date, max_points, instructions, active, target_type) VALUES
('assign_001', 'course_001', 'unit_001', 'Algebra Worksheet', 'Practice problems on algebraic expressions', '2023-03-01 09:00:00', '2023-03-08 23:59:00', 100, 'Complete all problems showing your work', true, 'INDIVIDUAL'),
('assign_002', 'course_001', 'unit_002', 'Geometry Proofs', 'Geometric theorem proofs assignment', '2023-03-02 09:00:00', '2023-03-09 23:59:00', 100, 'Provide detailed proofs for each theorem', true, 'INDIVIDUAL'),
('assign_003', 'course_002', 'unit_003', 'Scientific Report', 'Lab report on scientific method', '2023-03-03 09:00:00', '2023-03-10 23:59:00', 100, 'Follow the scientific method format', true, 'TEAM'),
('assign_004', 'course_002', 'unit_004', 'Biology Research', 'Research paper on cell biology', '2023-03-04 09:00:00', '2023-03-11 23:59:00', 100, 'Include citations and references', true, 'INDIVIDUAL'),
('assign_005', 'course_003', 'unit_005', 'Grammar Exercise', 'Grammar rules application', '2023-03-05 09:00:00', '2023-03-12 23:59:00', 100, 'Complete all grammar exercises', true, 'INDIVIDUAL'),
('assign_006', 'course_003', 'unit_006', 'Essay Writing', '500-word essay on given topic', '2023-03-06 09:00:00', '2023-03-13 23:59:00', 100, 'Follow MLA formatting guidelines', true, 'INDIVIDUAL'),
('assign_007', 'course_004', 'unit_007', 'History Analysis', 'Analysis of ancient civilizations', '2023-03-07 09:00:00', '2023-03-14 23:59:00', 100, 'Compare and contrast two civilizations', true, 'TEAM'),
('assign_008', 'course_004', 'unit_008', 'Medieval Timeline', 'Timeline of medieval events', '2023-03-08 09:00:00', '2023-03-15 23:59:00', 100, 'Include major events and figures', true, 'INDIVIDUAL'),
('assign_009', 'course_005', 'unit_009', 'Cell Diagram', 'Labeled cell structure diagram', '2023-03-09 09:00:00', '2023-03-16 23:59:00', 100, 'Create detailed labeled diagrams', true, 'INDIVIDUAL'),
('assign_010', 'course_005', 'unit_010', 'Genetics Problems', 'Mendelian genetics problems', '2023-03-10 09:00:00', '2023-03-17 23:59:00', 100, 'Solve all genetics problems', true, 'INDIVIDUAL'),
('assign_011', 'course_006', 'unit_011', 'Atomic Models', 'Atomic structure models', '2023-03-11 09:00:00', '2023-03-18 23:59:00', 100, 'Create atomic models with explanations', true, 'TEAM'),
('assign_012', 'course_006', 'unit_012', 'Chemical Equations', 'Balance chemical equations', '2023-03-12 09:00:00', '2023-03-19 23:59:00', 100, 'Balance all given equations', true, 'INDIVIDUAL'),
('assign_013', 'course_007', 'unit_013', 'Physics Problems', 'Mechanics problem set', '2023-03-13 09:00:00', '2023-03-20 23:59:00', 100, 'Show all calculations and formulas', true, 'INDIVIDUAL'),
('assign_014', 'course_007', 'unit_014', 'Thermodynamics Lab', 'Heat transfer experiment report', '2023-03-14 09:00:00', '2023-03-21 23:59:00', 100, 'Include experimental data and analysis', true, 'TEAM'),
('assign_015', 'course_008', 'unit_015', 'Art Analysis', 'Analysis of art movement', '2023-03-15 09:00:00', '2023-03-22 23:59:00', 100, 'Analyze specific art pieces', true, 'INDIVIDUAL'),
('assign_016', 'course_008', 'unit_016', 'Color Theory Project', 'Color wheel and schemes', '2023-03-16 09:00:00', '2023-03-23 23:59:00', 100, 'Create color theory examples', true, 'INDIVIDUAL'),
('assign_017', 'course_009', 'unit_017', 'Music Composition', 'Original music composition', '2023-03-17 09:00:00', '2023-03-24 23:59:00', 100, 'Compose 16-bar melody', true, 'INDIVIDUAL'),
('assign_018', 'course_009', 'unit_018', 'Harmony Analysis', 'Chord progression analysis', '2023-03-18 09:00:00', '2023-03-25 23:59:00', 100, 'Analyze given musical pieces', true, 'TEAM'),
('assign_019', 'course_010', 'unit_019', 'Programming Exercise', 'Basic programming problems', '2023-03-19 09:00:00', '2023-03-26 23:59:00', 100, 'Write and test code solutions', true, 'INDIVIDUAL'),
('assign_020', 'course_010', 'unit_020', 'Data Structures', 'Implement basic data structures', '2023-03-20 09:00:00', '2023-03-27 23:59:00', 100, 'Code and test data structures', true, 'INDIVIDUAL');

-- Insert sample data for pages (20 records)
INSERT INTO pages (id, course_id, unit_id, title, content, created_at, last_modified, published) VALUES
('page_001', 'course_001', 'unit_001', 'Algebra Introduction', 'Welcome to algebra basics...', '2023-02-01 10:00:00', '2023-02-01 10:00:00', true),
('page_002', 'course_001', 'unit_001', 'Variables and Expressions', 'Understanding variables...', '2023-02-02 10:00:00', '2023-02-02 10:00:00', true),
('page_003', 'course_001', 'unit_002', 'Geometry Basics', 'Introduction to geometry...', '2023-02-03 10:00:00', '2023-02-03 10:00:00', true),
('page_004', 'course_002', 'unit_003', 'Scientific Method', 'Steps of scientific method...', '2023-02-04 10:00:00', '2023-02-04 10:00:00', true),
('page_005', 'course_002', 'unit_004', 'Cell Structure', 'Detailed cell anatomy...', '2023-02-05 10:00:00', '2023-02-05 10:00:00', true),
('page_006', 'course_003', 'unit_005', 'Grammar Rules', 'Essential grammar rules...', '2023-02-06 10:00:00', '2023-02-06 10:00:00', true),
('page_007', 'course_003', 'unit_006', 'Writing Tips', 'Effective writing strategies...', '2023-02-07 10:00:00', '2023-02-07 10:00:00', true),
('page_008', 'course_004', 'unit_007', 'Ancient Egypt', 'Egyptian civilization...', '2023-02-08 10:00:00', '2023-02-08 10:00:00', true),
('page_009', 'course_004', 'unit_008', 'Medieval Europe', 'European middle ages...', '2023-02-09 10:00:00', '2023-02-09 10:00:00', true),
('page_010', 'course_005', 'unit_009', 'Mitochondria', 'Powerhouse of the cell...', '2023-02-10 10:00:00', '2023-02-10 10:00:00', true),
('page_011', 'course_005', 'unit_010', 'DNA Structure', 'Double helix explained...', '2023-02-11 10:00:00', '2023-02-11 10:00:00', true),
('page_012', 'course_006', 'unit_011', 'Atomic Theory', 'Development of atomic theory...', '2023-02-12 10:00:00', '2023-02-12 10:00:00', true),
('page_013', 'course_006', 'unit_012', 'Chemical Bonds', 'Types of chemical bonds...', '2023-02-13 10:00:00', '2023-02-13 10:00:00', true),
('page_014', 'course_007', 'unit_013', 'Newton Laws', 'Newtons laws of motion...', '2023-02-14 10:00:00', '2023-02-14 10:00:00', true),
('page_015', 'course_007', 'unit_014', 'Thermodynamics', 'Laws of thermodynamics...', '2023-02-15 10:00:00', '2023-02-15 10:00:00', true),
('page_016', 'course_008', 'unit_015', 'Renaissance Art', 'Renaissance art movement...', '2023-02-16 10:00:00', '2023-02-16 10:00:00', true),
('page_017', 'course_008', 'unit_016', 'Color Psychology', 'Psychology of colors...', '2023-02-17 10:00:00', '2023-02-17 10:00:00', true),
('page_018', 'course_009', 'unit_017', 'Music Notation', 'Reading music scores...', '2023-02-18 10:00:00', '2023-02-18 10:00:00', true),
('page_019', 'course_009', 'unit_018', 'Chord Progressions', 'Common chord patterns...', '2023-02-19 10:00:00', '2023-02-19 10:00:00', true),
('page_020', 'course_010', 'unit_019', 'Programming Logic', 'Basic programming concepts...', '2023-02-20 10:00:00', '2023-02-20 10:00:00', true);

-- Insert sample data for page_external_links
INSERT INTO page_external_links (page_id, url) VALUES
('page_001', 'https://example.com/algebra-resources'),
('page_002', 'https://example.com/variables-tutorial'),
('page_003', 'https://example.com/geometry-basics'),
('page_004', 'https://example.com/scientific-method'),
('page_005', 'https://example.com/cell-biology'),
('page_006', 'https://example.com/grammar-rules'),
('page_007', 'https://example.com/writing-guide'),
('page_008', 'https://example.com/ancient-egypt'),
('page_009', 'https://example.com/medieval-history'),
('page_010', 'https://example.com/mitochondria'),
('page_011', 'https://example.com/dna-structure'),
('page_012', 'https://example.com/atomic-theory'),
('page_013', 'https://example.com/chemical-bonds'),
('page_014', 'https://example.com/newton-laws'),
('page_015', 'https://example.com/thermodynamics'),
('page_016', 'https://example.com/renaissance-art'),
('page_017', 'https://example.com/color-psychology'),
('page_018', 'https://example.com/music-notation'),
('page_019', 'https://example.com/chord-progressions'),
('page_020', 'https://example.com/programming-logic');

-- Insert sample data for quizzes (20 records)
INSERT INTO quizzes (id, course_id, unit_id, title, description, available_from, available_until, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, created_at, active) VALUES
('quiz_001', 'course_001', 'unit_001', 'Algebra Quiz 1', 'Basic algebra concepts', '2023-03-01 00:00:00', '2023-03-15 23:59:00', 30, 3, true, true, '2023-02-25 09:00:00', true),
('quiz_002', 'course_001', 'unit_002', 'Geometry Quiz', 'Geometric shapes and theorems', '2023-03-02 00:00:00', '2023-03-16 23:59:00', 45, 2, true, false, '2023-02-26 09:00:00', true),
('quiz_003', 'course_002', 'unit_003', 'Science Methods Quiz', 'Scientific method application', '2023-03-03 00:00:00', '2023-03-17 23:59:00', 25, 3, false, true, '2023-02-27 09:00:00', true),
('quiz_004', 'course_002', 'unit_004', 'Biology Basics Quiz', 'Cell biology fundamentals', '2023-03-04 00:00:00', '2023-03-18 23:59:00', 35, 2, true, true, '2023-02-28 09:00:00', true),
('quiz_005', 'course_003', 'unit_005', 'Grammar Quiz', 'Grammar rules assessment', '2023-03-05 00:00:00', '2023-03-19 23:59:00', 20, 3, false, false, '2023-03-01 09:00:00', true),
('quiz_006', 'course_003', 'unit_006', 'Writing Concepts Quiz', 'Writing techniques and concepts', '2023-03-06 00:00:00', '2023-03-20 23:59:00', 40, 2, true, true, '2023-03-02 09:00:00', true),
('quiz_007', 'course_004', 'unit_007', 'Ancient History Quiz', 'Ancient civilizations knowledge', '2023-03-07 00:00:00', '2023-03-21 23:59:00', 30, 3, true, false, '2023-03-03 09:00:00', true),
('quiz_008', 'course_004', 'unit_008', 'Medieval History Quiz', 'Medieval period assessment', '2023-03-08 00:00:00', '2023-03-22 23:59:00', 35, 2, false, true, '2023-03-04 09:00:00', true),
('quiz_009', 'course_005', 'unit_009', 'Cell Biology Quiz', 'Cellular structure and function', '2023-03-09 00:00:00', '2023-03-23 23:59:00', 25, 3, true, true, '2023-03-05 09:00:00', true),
('quiz_010', 'course_005', 'unit_010', 'Genetics Quiz', 'Mendelian genetics principles', '2023-03-10 00:00:00', '2023-03-24 23:59:00', 30, 2, true, false, '2023-03-06 09:00:00', true),
('quiz_011', 'course_006', 'unit_011', 'Atomic Theory Quiz', 'Atomic structure concepts', '2023-03-11 00:00:00', '2023-03-25 23:59:00', 20, 3, false, true, '2023-03-07 09:00:00', true),
('quiz_012', 'course_006', 'unit_012', 'Chemical Reactions Quiz', 'Chemical equations and reactions', '2023-03-12 00:00:00', '2023-03-26 23:59:00', 35, 2, true, true, '2023-03-08 09:00:00', true),
('quiz_013', 'course_007', 'unit_013', 'Physics Mechanics Quiz', 'Mechanics principles', '2023-03-13 00:00:00', '2023-03-27 23:59:00', 40, 3, true, false, '2023-03-09 09:00:00', true),
('quiz_014', 'course_007', 'unit_014', 'Thermodynamics Quiz', 'Heat and energy concepts', '2023-03-14 00:00:00', '2023-03-28 23:59:00', 30, 2, false, true, '2023-03-10 09:00:00', true),
('quiz_015', 'course_008', 'unit_015', 'Art History Quiz', 'Art movements knowledge', '2023-03-15 00:00:00', '2023-03-29 23:59:00', 25, 3, true, true, '2023-03-11 09:00:00', true),
('quiz_016', 'course_008', 'unit_016', 'Color Theory Quiz', 'Color principles assessment', '2023-03-16 00:00:00', '2023-03-30 23:59:00', 20, 2, true, false, '2023-03-12 09:00:00', true),
('quiz_017', 'course_009', 'unit_017', 'Music Notation Quiz', 'Reading music notation', '2023-03-17 00:00:00', '2023-03-31 23:59:00', 30, 3, false, true, '2023-03-13 09:00:00', true),
('quiz_018', 'course_009', 'unit_018', 'Harmony Quiz', 'Chord structures and progressions', '2023-03-18 00:00:00', '2023-04-01 23:59:00', 35, 2, true, true, '2023-03-14 09:00:00', true),
('quiz_019', 'course_010', 'unit_019', 'Programming Basics Quiz', 'Basic programming concepts', '2023-03-19 00:00:00', '2023-04-02 23:59:00', 25, 3, true, false, '2023-03-15 09:00:00', true),
('quiz_020', 'course_010', 'unit_020', 'Data Structures Quiz', 'Data organization concepts', '2023-03-20 00:00:00', '2023-04-03 23:59:00', 40, 2, false, true, '2023-03-16 09:00:00', true);

-- Insert sample data for quiz_questions (multiple per quiz)
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, options_json, correct_answer) VALUES
('qq_001', 'quiz_001', 'What is 2x + 3 = 7?', 'MULTIPLE_CHOICE', 10, '["x=1", "x=2", "x=3", "x=4"]', 'x=2'),
('qq_002', 'quiz_001', 'Solve for y: y - 5 = 10', 'MULTIPLE_CHOICE', 10, '["y=10", "y=15", "y=5", "y=20"]', 'y=15'),
('qq_003', 'quiz_002', 'What is the area of a circle?', 'MULTIPLE_CHOICE', 10, '["πr²", "2πr", "πd", "2πr²"]', 'πr²'),
('qq_004', 'quiz_002', 'How many degrees in a triangle?', 'MULTIPLE_CHOICE', 10, '["90", "180", "270", "360"]', '180'),
('qq_005', 'quiz_003', 'What is the first step of scientific method?', 'MULTIPLE_CHOICE', 10, '["Hypothesis", "Observation", "Experiment", "Conclusion"]', 'Observation'),
('qq_006', 'quiz_003', 'What is a controlled variable?', 'MULTIPLE_CHOICE', 10, '["Variable that changes", "Variable that stays constant", "Dependent variable", "Independent variable"]', 'Variable that stays constant'),
('qq_007', 'quiz_004', 'What is the powerhouse of the cell?', 'MULTIPLE_CHOICE', 10, '["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"]', 'Mitochondria'),
('qq_008', 'quiz_004', 'Where is DNA located in eukaryotic cells?', 'MULTIPLE_CHOICE', 10, '["Cytoplasm", "Nucleus", "Cell membrane", "Mitochondria"]', 'Nucleus'),
('qq_009', 'quiz_005', 'Which is a proper noun?', 'MULTIPLE_CHOICE', 10, '["run", "city", "New York", "beautiful"]', 'New York'),
('qq_010', 'quiz_005', 'What is a verb?', 'MULTIPLE_CHOICE', 10, '["Action word", "Describing word", "Person, place, thing", "Connecting word"]', 'Action word'),
('qq_011', 'quiz_006', 'What is a thesis statement?', 'MULTIPLE_CHOICE', 10, '["Main idea of essay", "Conclusion", "Introduction", "Bibliography"]', 'Main idea of essay'),
('qq_012', 'quiz_006', 'What is MLA format?', 'MULTIPLE_CHOICE', 10, '["Writing style guide", "Math formula", "Science experiment", "Art technique"]', 'Writing style guide'),
('qq_013', 'quiz_007', 'Which civilization built pyramids?', 'MULTIPLE_CHOICE', 10, '["Romans", "Greeks", "Egyptians", "Chinese"]', 'Egyptians'),
('qq_014', 'quiz_007', 'Where was Mesopotamia located?', 'MULTIPLE_CHOICE', 10, '["Middle East", "Europe", "Asia", "Africa"]', 'Middle East'),
('qq_015', 'quiz_008', 'When was the Magna Carta signed?', 'MULTIPLE_CHOICE', 10, '["1066", "1215", "1492", "1776"]', '1215'),
('qq_016', 'quiz_008', 'Who was Charlemagne?', 'MULTIPLE_CHOICE', 10, '["Roman emperor", "French king", "Holy Roman Emperor", "English king"]', 'Holy Roman Emperor'),
('qq_017', 'quiz_009', 'What does DNA stand for?', 'MULTIPLE_CHOICE', 10, '["Deoxyribonucleic Acid", "Ribonucleic Acid", "Protein chain", "Cell membrane"]', 'Deoxyribonucleic Acid'),
('qq_018', 'quiz_009', 'What is mitosis?', 'MULTIPLE_CHOICE', 10, '["Cell division", "Protein synthesis", "Energy production", "Waste removal"]', 'Cell division'),
('qq_019', 'quiz_010', 'What is a dominant gene?', 'MULTIPLE_CHOICE', 10, '["Always expressed", "Never expressed", "Sometimes expressed", "Recessive"]', 'Always expressed'),
('qq_020', 'quiz_010', 'Who is the father of genetics?', 'MULTIPLE_CHOICE', 10, '["Darwin", "Mendel", "Watson", "Crick"]', 'Mendel');

-- Insert sample data for submissions (20 records)
INSERT INTO submissions (id, assignment_id, student_id, team_id, content, submitted_at, status, grade_value, grade_max_score, teacher_feedback) VALUES
('sub_001', 'assign_001', 'user_002', NULL, 'Completed algebra worksheet with all problems solved.', '2023-03-05 14:30:00', 'SUBMITTED', 85.0, 100.0, 'Good work, but check problem #7'),
('sub_002', 'assign_001', 'user_003', NULL, 'Algebra assignment completed with detailed work.', '2023-03-05 15:45:00', 'GRADED', 92.0, 100.0, 'Excellent work showing all steps'),
('sub_003', 'assign_002', 'user_004', NULL, 'Geometry proofs assignment submission.', '2023-03-06 10:20:00', 'SUBMITTED', 78.0, 100.0, 'Need more detail in proof explanations'),
('sub_004', 'assign_003', 'user_005', 'group_003', 'Team scientific report on lab experiment.', '2023-03-07 16:15:00', 'GRADED', 88.0, 100.0, 'Well-structured report with good data'),
('sub_005', 'assign_004', 'user_006', NULL, 'Biology research paper on cell structure.', '2023-03-08 11:30:00', 'SUBMITTED', 95.0, 100.0, 'Outstanding research and analysis'),
('sub_006', 'assign_005', 'user_007', NULL, 'Grammar exercises completed.', '2023-03-09 09:45:00', 'GRADED', 82.0, 100.0, 'Good overall, review verb tenses'),
('sub_007', 'assign_006', 'user_008', NULL, '500-word essay on climate change.', '2023-03-10 13:20:00', 'SUBMITTED', 90.0, 100.0, 'Well-argued essay with good evidence'),
('sub_008', 'assign_007', 'user_009', 'group_007', 'Team analysis of ancient civilizations.', '2023-03-11 14:50:00', 'GRADED', 87.0, 100.0, 'Good comparative analysis'),
('sub_009', 'assign_008', 'user_010', NULL, 'Medieval timeline with major events.', '2023-03-12 12:10:00', 'SUBMITTED', 93.0, 100.0, 'Comprehensive and well-organized'),
('sub_010', 'assign_009', 'user_011', NULL, 'Cell structure diagrams with labels.', '2023-03-13 15:30:00', 'GRADED', 79.0, 100.0, 'Accurate diagrams, add more detail'),
('sub_011', 'assign_010', 'user_012', NULL, 'Genetics problems solutions.', '2023-03-14 10:45:00', 'SUBMITTED', 86.0, 100.0, 'Good problem-solving approach'),
('sub_012', 'assign_011', 'user_013', 'group_011', 'Team atomic models project.', '2023-03-15 16:20:00', 'GRADED', 91.0, 100.0, 'Creative and accurate models'),
('sub_013', 'assign_012', 'user_014', NULL, 'Balanced chemical equations.', '2023-03-16 11:15:00', 'SUBMITTED', 84.0, 100.0, 'Most equations correct, check #5'),
('sub_014', 'assign_013', 'user_015', NULL, 'Physics mechanics problem set.', '2023-03-17 14:40:00', 'GRADED', 89.0, 100.0, 'Good application of formulas'),
('sub_015', 'assign_014', 'user_016', 'group_014', 'Team thermodynamics lab report.', '2023-03-18 13:25:00', 'SUBMITTED', 94.0, 100.0, 'Excellent experimental design'),
('sub_016', 'assign_015', 'user_017', NULL, 'Art movement analysis paper.', '2023-03-19 09:50:00', 'GRADED', 81.0, 100.0, 'Good analysis, expand on influences'),
('sub_017', 'assign_016', 'user_018', NULL, 'Color theory project submission.', '2023-03-20 15:10:00', 'SUBMITTED', 88.0, 100.0, 'Creative use of color schemes'),
('sub_018', 'assign_017', 'user_019', NULL, 'Original music composition.', '2023-03-21 12:35:00', 'GRADED', 92.0, 100.0, 'Beautiful melody with good structure'),
('sub_019', 'assign_018', 'user_002', 'group_018', 'Team harmony analysis project.', '2023-03-22 14:00:00', 'SUBMITTED', 85.0, 100.0, 'Thorough analysis of chord progressions'),
('sub_020', 'assign_019', 'user_003', NULL, 'Programming exercises solutions.', '2023-03-23 16:45:00', 'GRADED', 90.0, 100.0, 'Clean and efficient code');

-- Insert sample data for quiz_submissions (20 records)
INSERT INTO quiz_submissions (id, quiz_id, student_id, attempt_number, started_at, submitted_at, status, answers_json, grade_value, grade_max_score, auto_graded) VALUES
('qsub_001', 'quiz_001', 'user_002', 1, '2023-03-02 10:00:00', '2023-03-02 10:25:00', 'COMPLETED', '{"q1": "x=2", "q2": "y=15"}', 18.0, 20.0, true),
('qsub_002', 'quiz_001', 'user_003', 1, '2023-03-02 11:30:00', '2023-03-02 11:50:00', 'COMPLETED', '{"q1": "x=2", "q2": "y=15"}', 20.0, 20.0, true),
('qsub_003', 'quiz_002', 'user_004', 1, '2023-03-03 09:15:00', '2023-03-03 09:45:00', 'COMPLETED', '{"q1": "πr²", "q2": "180"}', 15.0, 20.0, true),
('qsub_004', 'quiz_002', 'user_005', 1, '2023-03-03 14:20:00', '2023-03-03 14:50:00', 'COMPLETED', '{"q1": "πr²", "q2": "180"}', 20.0, 20.0, true),
('qsub_005', 'quiz_003', 'user_006', 1, '2023-03-04 10:45:00', '2023-03-04 11:05:00', 'COMPLETED', '{"q1": "Observation", "q2": "Variable that stays constant"}', 18.0, 20.0, true),
('qsub_006', 'quiz_003', 'user_007', 1, '2023-03-04 13:10:00', '2023-03-04 13:30:00', 'COMPLETED', '{"q1": "Observation", "q2": "Variable that stays constant"}', 20.0, 20.0, true),
('qsub_007', 'quiz_004', 'user_008', 1, '2023-03-05 11:25:00', '2023-03-05 11:50:00', 'COMPLETED', '{"q1": "Mitochondria", "q2": "Nucleus"}', 16.0, 20.0, true),
('qsub_008', 'quiz_004', 'user_009', 1, '2023-03-05 15:40:00', '2023-03-05 16:05:00', 'COMPLETED', '{"q1": "Mitochondria", "q2": "Nucleus"}', 20.0, 20.0, true),
('qsub_009', 'quiz_005', 'user_010', 1, '2023-03-06 09:50:00', '2023-03-06 10:05:00', 'COMPLETED', '{"q1": "New York", "q2": "Action word"}', 17.0, 20.0, true),
('qsub_010', 'quiz_005', 'user_011', 1, '2023-03-06 14:15:00', '2023-03-06 14:30:00', 'COMPLETED', '{"q1": "New York", "q2": "Action word"}', 20.0, 20.0, true),
('qsub_011', 'quiz_006', 'user_012', 1, '2023-03-07 10:30:00', '2023-03-07 11:00:00', 'COMPLETED', '{"q1": "Main idea of essay", "q2": "Writing style guide"}', 19.0, 20.0, true),
('qsub_012', 'quiz_006', 'user_013', 1, '2023-03-07 13:45:00', '2023-03-07 14:15:00', 'COMPLETED', '{"q1": "Main idea of essay", "q2": "Writing style guide"}', 20.0, 20.0, true),
('qsub_013', 'quiz_007', 'user_014', 1, '2023-03-08 11:10:00', '2023-03-08 11:35:00', 'COMPLETED', '{"q1": "Egyptians", "q2": "Middle East"}', 18.0, 20.0, true),
('qsub_014', 'quiz_007', 'user_015', 1, '2023-03-08 16:20:00', '2023-03-08 16:45:00', 'COMPLETED', '{"q1": "Egyptians", "q2": "Middle East"}', 20.0, 20.0, true),
('qsub_015', 'quiz_008', 'user_016', 1, '2023-03-09 10:05:00', '2023-03-09 10:35:00', 'COMPLETED', '{"q1": "1215", "q2": "Holy Roman Emperor"}', 16.0, 20.0, true),
('qsub_016', 'quiz_008', 'user_017', 1, '2023-03-09 14:30:00', '2023-03-09 15:00:00', 'COMPLETED', '{"q1": "1215", "q2": "Holy Roman Emperor"}', 20.0, 20.0, true),
('qsub_017', 'quiz_009', 'user_018', 1, '2023-03-10 09:40:00', '2023-03-10 10:00:00', 'COMPLETED', '{"q1": "Deoxyribonucleic Acid", "q2": "Cell division"}', 17.0, 20.0, true),
('qsub_018', 'quiz_009', 'user_019', 1, '2023-03-10 15:15:00', '2023-03-10 15:35:00', 'COMPLETED', '{"q1": "Deoxyribonucleic Acid", "q2": "Cell division"}', 20.0, 20.0, true),
('qsub_019', 'quiz_010', 'user_002', 1, '2023-03-11 11:25:00', '2023-03-11 11:50:00', 'COMPLETED', '{"q1": "Always expressed", "q2": "Mendel"}', 19.0, 20.0, true),
('qsub_020', 'quiz_010', 'user_003', 1, '2023-03-11 16:40:00', '2023-03-11 17:05:00', 'COMPLETED', '{"q1": "Always expressed", "q2": "Mendel"}', 20.0, 20.0, true);

-- Insert sample data for documents (20 records)
INSERT INTO documents (id, name, storage_path, assignment_id, submission_id, page_id) VALUES
('doc_001', 'algebra_worksheet.pdf', '/documents/assignments/alg_ws.pdf', 'assign_001', NULL, NULL),
('doc_002', 'geometry_proofs.docx', '/documents/assignments/geo_proofs.docx', 'assign_002', NULL, NULL),
('doc_003', 'scientific_report.pdf', '/documents/assignments/sci_report.pdf', 'assign_003', NULL, NULL),
('doc_004', 'biology_research.pdf', '/documents/assignments/bio_research.pdf', 'assign_004', NULL, NULL),
('doc_005', 'grammar_exercises.pdf', '/documents/assignments/grammar_ex.pdf', 'assign_005', NULL, NULL),
('doc_006', 'algebra_solution.pdf', '/documents/submissions/alg_sol.pdf', NULL, 'sub_001', NULL),
('doc_007', 'geometry_submission.pdf', '/documents/submissions/geo_sub.pdf', NULL, 'sub_003', NULL),
('doc_008', 'science_lab_data.xlsx', '/documents/submissions/sci_data.xlsx', NULL, 'sub_004', NULL),
('doc_009', 'biology_paper.docx', '/documents/submissions/bio_paper.docx', NULL, 'sub_005', NULL),
('doc_010', 'grammar_answers.pdf', '/documents/submissions/gram_ans.pdf', NULL, 'sub_006', NULL),
('doc_011', 'lecture_notes.pdf', '/documents/pages/lecture_notes.pdf', NULL, NULL, 'page_001'),
('doc_012', 'study_guide.docx', '/documents/pages/study_guide.docx', NULL, NULL, 'page_002'),
('doc_013', 'lab_manual.pdf', '/documents/pages/lab_manual.pdf', NULL, NULL, 'page_004'),
('doc_014', 'reference_material.pdf', '/documents/pages/ref_material.pdf', NULL, NULL, 'page_005'),
('doc_015', 'writing_template.docx', '/documents/pages/writing_template.docx', NULL, NULL, 'page_007'),
('doc_016', 'history_timeline.pdf', '/documents/pages/history_timeline.pdf', NULL, NULL, 'page_008'),
('doc_017', 'biology_diagrams.pdf', '/documents/pages/bio_diagrams.pdf', NULL, NULL, 'page_010'),
('doc_018', 'chemistry_charts.pdf', '/documents/pages/chem_charts.pdf', NULL, NULL, 'page_012'),
('doc_019', 'physics_formulas.pdf', '/documents/pages/phys_formulas.pdf', NULL, NULL, 'page_014'),
('doc_020', 'art_examples.pdf', '/documents/pages/art_examples.pdf', NULL, NULL, 'page_016');

-- Insert sample data for gradebooks (20 records)
INSERT INTO gradebooks (id, course_id, student_id, calculated_total_value, final_grade_value, final_feedback, last_calculated) VALUES
('gb_001', 'course_001', 'user_002', 85.5, 87.0, 'Good overall performance with consistent work', '2023-06-01 10:00:00'),
('gb_002', 'course_001', 'user_003', 92.0, 93.0, 'Excellent work throughout the course', '2023-06-01 10:00:00'),
('gb_003', 'course_001', 'user_004', 78.0, 80.0, 'Showed improvement in later assignments', '2023-06-01 10:00:00'),
('gb_004', 'course_002', 'user_005', 88.5, 90.0, 'Strong performance in lab work', '2023-06-01 10:00:00'),
('gb_005', 'course_002', 'user_006', 95.0, 95.0, 'Outstanding in all aspects of the course', '2023-06-01 10:00:00'),
('gb_006', 'course_003', 'user_007', 82.0, 85.0, 'Good writing skills with room for growth', '2023-06-01 10:00:00'),
('gb_007', 'course_003', 'user_008', 90.5, 92.0, 'Excellent analytical writing ability', '2023-06-01 10:00:00'),
('gb_008', 'course_004', 'user_009', 87.0, 88.0, 'Strong historical analysis skills', '2023-06-01 10:00:00'),
('gb_009', 'course_004', 'user_010', 93.5, 94.0, 'Exceptional research and writing', '2023-06-01 10:00:00'),
('gb_010', 'course_005', 'user_011', 79.0, 82.0, 'Good understanding of biological concepts', '2023-06-01 10:00:00'),
('gb_011', 'course_005', 'user_012', 86.5, 88.0, 'Strong performance in genetics topics', '2023-06-01 10:00:00'),
('gb_012', 'course_006', 'user_013', 91.0, 92.0, 'Excellent grasp of chemical principles', '2023-06-01 10:00:00'),
('gb_013', 'course_006', 'user_014', 84.5, 86.0, 'Good problem-solving skills', '2023-06-01 10:00:00'),
('gb_014', 'course_007', 'user_015', 89.0, 90.0, 'Strong analytical abilities in physics', '2023-06-01 10:00:00'),
('gb_015', 'course_007', 'user_016', 94.5, 95.0, 'Exceptional understanding of physical concepts', '2023-06-01 10:00:00'),
('gb_016', 'course_008', 'user_017', 81.0, 83.0, 'Good artistic analysis and creativity', '2023-06-01 10:00:00'),
('gb_017', 'course_008', 'user_018', 88.5, 90.0, 'Strong color theory application', '2023-06-01 10:00:00'),
('gb_018', 'course_009', 'user_019', 92.0, 93.0, 'Excellent musical composition skills', '2023-06-01 10:00:00'),
('gb_019', 'course_009', 'user_002', 85.5, 87.0, 'Good understanding of music theory', '2023-06-01 10:00:00'),
('gb_020', 'course_010', 'user_003', 90.0, 91.0, 'Strong programming and problem-solving', '2023-06-01 10:00:00');

-- Insert sample data for unit_grades (20 records)
INSERT INTO unit_grades (id, unit_id, student_id, calculated_total_value, final_grade_value, final_feedback, assignment_grades_json, quiz_grades_json, last_calculated) VALUES
('ug_001', 'unit_001', 'user_002', 85.0, 87.0, 'Good understanding of algebraic concepts', '{"assign_001": 85}', '{"quiz_001": 18}', '2023-06-01 10:00:00'),
('ug_002', 'unit_001', 'user_003', 92.0, 93.0, 'Excellent algebraic problem-solving', '{"assign_001": 92}', '{"quiz_001": 20}', '2023-06-01 10:00:00'),
('ug_003', 'unit_002', 'user_004', 78.0, 80.0, 'Basic understanding of geometry', '{"assign_002": 78}', '{"quiz_002": 15}', '2023-06-01 10:00:00'),
('ug_004', 'unit_003', 'user_005', 88.0, 90.0, 'Strong scientific method application', '{"assign_003": 88}', '{"quiz_003": 18}', '2023-06-01 10:00:00'),
('ug_005', 'unit_004', 'user_006', 95.0, 95.0, 'Outstanding biology knowledge', '{"assign_004": 95}', '{"quiz_004": 20}', '2023-06-01 10:00:00'),
('ug_006', 'unit_005', 'user_007', 82.0, 85.0, 'Good grammar foundation', '{"assign_005": 82}', '{"quiz_005": 17}', '2023-06-01 10:00:00'),
('ug_007', 'unit_006', 'user_008', 90.0, 92.0, 'Excellent writing skills', '{"assign_006": 90}', '{"quiz_006": 20}', '2023-06-01 10:00:00'),
('ug_008', 'unit_007', 'user_009', 87.0, 88.0, 'Strong historical analysis', '{"assign_007": 87}', '{"quiz_007": 18}', '2023-06-01 10:00:00'),
('ug_009', 'unit_008', 'user_010', 93.0, 94.0, 'Exceptional timeline accuracy', '{"assign_008": 93}', '{"quiz_008": 20}', '2023-06-01 10:00:00'),
('ug_010', 'unit_009', 'user_011', 79.0, 82.0, 'Good cell biology understanding', '{"assign_009": 79}', '{"quiz_009": 17}', '2023-06-01 10:00:00'),
('ug_011', 'unit_010', 'user_012', 86.0, 88.0, 'Strong genetics problem-solving', '{"assign_010": 86}', '{"quiz_010": 20}', '2023-06-01 10:00:00'),
('ug_012', 'unit_011', 'user_013', 91.0, 92.0, 'Excellent atomic theory knowledge', '{"assign_011": 91}', '{"quiz_011": 19}', '2023-06-01 10:00:00'),
('ug_013', 'unit_012', 'user_014', 84.0, 86.0, 'Good chemical equation balancing', '{"assign_012": 84}', '{"quiz_012": 20}', '2023-06-01 10:00:00'),
('ug_014', 'unit_013', 'user_015', 89.0, 90.0, 'Strong mechanics application', '{"assign_013": 89}', '{"quiz_013": 18}', '2023-06-01 10:00:00'),
('ug_015', 'unit_014', 'user_016', 94.0, 95.0, 'Exceptional thermodynamics understanding', '{"assign_014": 94}', '{"quiz_014": 20}', '2023-06-01 10:00:00'),
('ug_016', 'unit_015', 'user_017', 81.0, 83.0, 'Good art movement analysis', '{"assign_015": 81}', '{"quiz_015": 16}', '2023-06-01 10:00:00'),
('ug_017', 'unit_016', 'user_018', 88.0, 90.0, 'Strong color theory application', '{"assign_016": 88}', '{"quiz_016": 20}', '2023-06-01 10:00:00'),
('ug_018', 'unit_017', 'user_019', 92.0, 93.0, 'Excellent music notation skills', '{"assign_017": 92}', '{"quiz_017": 17}', '2023-06-01 10:00:00'),
('ug_019', 'unit_018', 'user_002', 85.0, 87.0, 'Good harmony analysis', '{"assign_018": 85}', '{"quiz_018": 20}', '2023-06-01 10:00:00'),
('ug_020', 'unit_019', 'user_003', 90.0, 91.0, 'Strong programming fundamentals', '{"assign_019": 90}', '{"quiz_019": 19}', '2023-06-01 10:00:00');

-- Insert sample data for analysis_requests (20 records)
INSERT INTO analysis_requests (id, submission_id, content, status, probability, model_used, confidence_level, detected_segments_json, error_message, created_at, analyzed_at) VALUES
('ar_001', 'sub_001', 'Completed algebra worksheet with all problems solved.', 'COMPLETED', 0.0234, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-05 16:00:00', '2023-03-05 16:05:00'),
('ar_002', 'sub_002', 'Algebra assignment completed with detailed work.', 'COMPLETED', 0.0156, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-05 17:00:00', '2023-03-05 17:04:00'),
('ar_003', 'sub_003', 'Geometry proofs assignment submission.', 'COMPLETED', 0.0890, 'AI_Detector_v2', 'MEDIUM', '[{"text": "theorem proof section", "probability": 0.15}]', NULL, '2023-03-06 11:00:00', '2023-03-06 11:06:00'),
('ar_004', 'sub_004', 'Team scientific report on lab experiment.', 'COMPLETED', 0.0123, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-07 17:00:00', '2023-03-07 17:03:00'),
('ar_005', 'sub_005', 'Biology research paper on cell structure.', 'COMPLETED', 0.0087, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-08 12:00:00', '2023-03-08 12:02:00'),
('ar_006', 'sub_006', 'Grammar exercises completed.', 'COMPLETED', 0.0456, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-09 10:00:00', '2023-03-09 10:04:00'),
('ar_007', 'sub_007', '500-word essay on climate change.', 'COMPLETED', 0.0678, 'AI_Detector_v2', 'MEDIUM', '[{"text": "climate change analysis section", "probability": 0.12}]', NULL, '2023-03-10 14:00:00', '2023-03-10 14:07:00'),
('ar_008', 'sub_008', 'Team analysis of ancient civilizations.', 'COMPLETED', 0.0345, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-11 15:00:00', '2023-03-11 15:03:00'),
('ar_009', 'sub_009', 'Medieval timeline with major events.', 'COMPLETED', 0.0098, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-12 13:00:00', '2023-03-12 13:01:00'),
('ar_010', 'sub_010', 'Cell structure diagrams with labels.', 'COMPLETED', 0.0789, 'AI_Detector_v2', 'MEDIUM', '[{"text": "cell description paragraph", "probability": 0.18}]', NULL, '2023-03-13 16:00:00', '2023-03-13 16:08:00'),
('ar_011', 'sub_011', 'Genetics problems solutions.', 'COMPLETED', 0.0231, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-14 11:00:00', '2023-03-14 11:02:00'),
('ar_012', 'sub_012', 'Team atomic models project.', 'COMPLETED', 0.0567, 'AI_Detector_v2', 'MEDIUM', '[{"text": "atomic theory explanation", "probability": 0.14}]', NULL, '2023-03-15 17:00:00', '2023-03-15 17:06:00'),
('ar_013', 'sub_013', 'Balanced chemical equations.', 'COMPLETED', 0.0321, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-16 12:00:00', '2023-03-16 12:03:00'),
('ar_014', 'sub_014', 'Physics mechanics problem set.', 'COMPLETED', 0.0198, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-17 15:00:00', '2023-03-17 15:02:00'),
('ar_015', 'sub_015', 'Team thermodynamics lab report.', 'COMPLETED', 0.0765, 'AI_Detector_v2', 'MEDIUM', '[{"text": "experimental procedure section", "probability": 0.16}]', NULL, '2023-03-18 14:00:00', '2023-03-18 14:08:00'),
('ar_016', 'sub_016', 'Art movement analysis paper.', 'COMPLETED', 0.0432, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-19 10:00:00', '2023-03-19 10:04:00'),
('ar_017', 'sub_017', 'Color theory project submission.', 'COMPLETED', 0.0289, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-20 16:00:00', '2023-03-20 16:03:00'),
('ar_018', 'sub_018', 'Original music composition.', 'COMPLETED', 0.0654, 'AI_Detector_v2', 'MEDIUM', '[{"text": "composition description", "probability": 0.13}]', NULL, '2023-03-21 13:00:00', '2023-03-21 13:07:00'),
('ar_019', 'sub_019', 'Team harmony analysis project.', 'COMPLETED', 0.0376, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-22 15:00:00', '2023-03-22 15:04:00'),
('ar_020', 'sub_020', 'Programming exercises solutions.', 'COMPLETED', 0.0210, 'AI_Detector_v2', 'LOW', '[]', NULL, '2023-03-23 17:00:00', '2023-03-23 17:02:00');








-- Update assignments due dates to November 2025
UPDATE assignments 
SET due_date = TIMESTAMP '2025-11-15 23:59:59'
WHERE due_date IS NOT NULL;

-- Update quizzes availability to November 2025
UPDATE quizzes 
SET 
    available_from = TIMESTAMP '2025-11-01 00:00:00',
    available_until = TIMESTAMP '2025-11-30 23:59:59'
WHERE available_from IS NOT NULL AND available_until IS NOT NULL;

-- Update quiz submissions dates to November 2025
UPDATE quiz_submissions 
SET 
    started_at = TIMESTAMP '2025-11-10 10:00:00',
    submitted_at = TIMESTAMP '2025-11-10 10:30:00'
WHERE started_at IS NOT NULL AND submitted_at IS NOT NULL;

-- Update assignment submissions to November 2025
UPDATE submissions 
SET submitted_at = TIMESTAMP '2025-11-12 14:30:00'
WHERE submitted_at IS NOT NULL;

-- Update analysis requests to November 2025
UPDATE analysis_requests 
SET 
    created_at = TIMESTAMP '2025-11-12 16:00:00',
    analyzed_at = TIMESTAMP '2025-11-12 16:05:00'
WHERE created_at IS NOT NULL AND analyzed_at IS NOT NULL;















