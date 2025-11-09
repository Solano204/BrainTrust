import csv
import itertools # Usaremos 'itertools.cycle' para alternar entre los IDs

def generate_repeated_submission_ids(num_records=10000):
    """
    Genera 10,000 registros para JMeter repitiendo cíclicamente
    los IDs de submission predefinidos.
    """

    # 1. Los IDs de Submission que SÍ existen en tu base de datos
    SUBMISSION_IDS = [
        "SUBM-ac7bfbcc-2b21-4fc4-9aa9-dd65e974fc29",
        "SUBM-0f6a9447-d5a8-45e2-9617-29a2eb1d66f8"
    ]

    # 2. Definir la ruta y el archivo de salida
    OUTPUT_FILE = 'test-data/submission-ids.csv'

    # Variables de control para datos asociados
    NUM_STUDENTS = 500
    NUM_ASSIGNMENTS = 100

    try:
        with open(OUTPUT_FILE, 'w', newline='') as f:
            writer = csv.writer(f)

            # Escribir la cabecera
            writer.writerow(['submissionId', 'studentEmail', 'assignmentId'])

            # Crear un 'ciclo infinito' de los IDs existentes
            id_cycler = itertools.cycle(SUBMISSION_IDS)

            for i in range(1, num_records + 1):

                # OBTENER EL SIGUIENTE ID DE LA LISTA (Alterna entre los dos)
                submission_id = next(id_cycler)

                # Generar datos asociados de manera predecible (para mantener el formato CSV)
                student_num = (i - 1) % NUM_STUDENTS + 1
                student_email = f"student{student_num:03d}@braintrust.com"

                assignment_num = (i - 1) % NUM_ASSIGNMENTS + 1
                assignment_id = f"assignment-{assignment_num:03d}"

                # Escribir la fila en el CSV
                writer.writerow([submission_id, student_email, assignment_id])

        print(f"✅ Generados {num_records} registros en {OUTPUT_FILE}")
        print("💡 Los IDs de submission están alternando entre:")
        print(f"   - {SUBMISSION_IDS[0]}")
        print(f"   - {SUBMISSION_IDS[1]}")

    except FileNotFoundError:
        print(f"❌ Error: El directorio 'test-data' no existe. Por favor, créalo o ajusta la ruta del archivo.")

if __name__ == "__main__":
    generate_repeated_submission_ids(num_records=10000)