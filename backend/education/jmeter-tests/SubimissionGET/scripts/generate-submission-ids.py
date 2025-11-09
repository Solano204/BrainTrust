# scripts/generate-submission-ids.py
import csv
import random

def generate_submission_ids():
    """Genera 10,000 submission IDs únicos para testing"""

    with open('test-data/submission-ids.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['submissionId', 'studentEmail', 'assignmentId'])

        for i in range(1, 10001):
            submission_id = f"submission-{i:06d}"
            student_email = f"student{(i % 500) + 1:03d}@braintrust.com"
            assignment_id = f"assignment-{(i % 100) + 1:03d}"

            writer.writerow([submission_id, student_email, assignment_id])

    print("✅ Generated 10,000 unique submission IDs in test-data/submission-ids.csv")
    print("📊 Sample IDs:")
    print("   - submission-000001")
    print("   - submission-005000")
    print("   - submission-010000")

if __name__ == "__main__":
    generate_submission_ids()