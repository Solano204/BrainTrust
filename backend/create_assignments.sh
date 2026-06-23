#!/bin/bash

# COURSE-2a038470 (Redacción Avanzada)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-2a038470-93d1-4f6e-bfbf-f312ac228474",
    "unitId": "UNIT-53fe09c7-b7f7-4b34-96f9-18dfeec0afa0",
    "title": "Ensayo Profesional",
    "description": "Redactar un ensayo sobre comunicación efectiva en el ámbito laboral",
    "dueDate": "2026-05-20T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Desarrollar un ensayo de 3 páginas con introducción, desarrollo y conclusión",
    "attachments": [],
    "links": ["https://es.wikipedia.org/wiki/Redaccion"],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

echo ""
echo "--- Waiting 1 second ---"
sleep 1

# COURSE-89f2183e (Álgebra Intermedia)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-89f2183e-8b37-4ae6-8860-8375e6b9c4f7",
    "unitId": "UNIT-6b51a9a9-e8ad-43cd-b750-3a737bce6db4",
    "title": "Sistema de Ecuaciones Lineales",
    "description": "Resolver sistemas de ecuaciones 2x2 y 3x3",
    "dueDate": "2026-06-10T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Resolver 10 sistemas de ecuaciones lineales",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-eb692fc2 (Español Básico)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-eb692fc2-5446-4c14-96ad-34f60d09d968",
    "unitId": "UNIT-093d804f-e61d-496e-979f-a5048e9553e9",
    "title": "Analisis Gramatical",
    "description": "Identificar y clasificar las partes de la oracion",
    "dueDate": "2026-05-15T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Analizar sintacticamente 15 oraciones",
    "attachments": [
      {
        "originalFilename": "Por supuesto.pdf",
        "uploadedUrl": "https://res.cloudinary.com/divbcrhk5/raw/upload/v1779428266/assignments/COURSE-975d70c8-816c-4aea-a7eb-d395c2a99274/sdaaaaaaaa/mbkvr0gkoqpxdiu2xfdq"
      }
    ],
    "links": ["https://concepto.de/historia/"],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-538650a0 (Química Orgánica)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-538650a0-77bc-4ada-b599-24935ba2d88f",
    "unitId": "UNIT-592f287e-cbeb-4312-97b5-9c8e2b467838",
    "title": "Nomenclatura de Hidrocarburos",
    "description": "Nombrar correctamente alcanos, alquenos y alquinos",
    "dueDate": "2026-05-28T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Realizar ejercicios de nomenclatura para 20 compuestos",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-baab2c9b (Cálculo Avanzado)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-baab2c9b-8c6c-40a0-a720-8afbd2f75afd",
    "unitId": "UNIT-14f47bba-5ff6-4171-acfb-56e41f184a8a",
    "title": "Derivadas y Aplicaciones",
    "description": "Calcular derivadas y resolver problemas de optimizacion",
    "dueDate": "2026-06-20T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Resolver 15 ejercicios de derivacion y 5 problemas de optimizacion",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-e9842a34 (Física Básica)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-e9842a34-fcba-410c-8cb4-c1ae24b37947",
    "unitId": "UNIT-440202e0-8b7e-42aa-bd0c-e0041fec5d47",
    "title": "Movimiento Rectilineo Uniforme",
    "description": "Resolver problemas de cinematica en una dimension",
    "dueDate": "2026-05-18T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Resolver 10 problemas de MRU y MRUV",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-098f8878 (Literatura Mexicana)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-098f8878-acf3-4170-b0b9-3b7240158055",
    "unitId": "UNIT-6e325622-2b2f-4cd5-9ea2-3ecba35dc5bd",
    "title": "Analisis Literario",
    "description": "Analizar la obra de Sor Juana Ines de la Cruz",
    "dueDate": "2026-06-05T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Realizar un analisis critico del texto",
    "attachments": [],
    "links": ["https://es.wikipedia.org/wiki/Sor_Juana_Ines_de_la_Cruz"],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-fbe0b855 (Mecánica Cuántica)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-fbe0b855-190a-4553-a615-e2a747ee1b2e",
    "unitId": "UNIT-ea38974a-39a7-4a4a-b345-8ce5b1aa136f",
    "title": "Principio de Incertidumbre",
    "description": "Aplicar el principio de incertidumbre de Heisenberg",
    "dueDate": "2026-06-25T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Resolver problemas de aplicacion del principio de incertidumbre",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-efb24efb (Inglés Básico)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-efb24efb-150b-4d54-bbe1-70400f840109",
    "unitId": "UNIT-8be0210f-ef51-4ee4-ab1c-d6e488d255fa",
    "title": "Present Simple vs Present Continuous",
    "description": "Completar ejercicios de tiempos verbales",
    "dueDate": "2026-05-25T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Realizar 30 ejercicios de completacion",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-a513eb96 (Electricidad y Magnetismo)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-a513eb96-060a-4b68-bbf7-c98a8c7e527c",
    "unitId": "UNIT-a870a912-a02e-4437-8e5a-2c470876cdc3",
    "title": "Circuitos en Serie y Paralelo",
    "description": "Calcular resistencia equivalente y corriente",
    "dueDate": "2026-05-30T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Resolver 8 circuitos mixtos",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-bf31de62 (Bioquímica Avanzada)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-bf31de62-8535-48cf-8515-805451c999cc",
    "unitId": "UNIT-241f84f8-0d0d-4dbd-9dc9-7117b5e6e97d",
    "title": "Ciclo de Krebs",
    "description": "Explicar las reacciones del ciclo de Krebs",
    "dueDate": "2026-06-15T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Dibujar el ciclo de Krebs e identificar cada enzima",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-a7be2230 (Química General)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-a7be2230-5ae9-4b33-86dd-72b2c68ea158",
    "unitId": "UNIT-4a9ee3b5-0879-47c5-a26c-67ef413685a2",
    "title": "Configuracion Electronica",
    "description": "Escribir configuraciones electronicas",
    "dueDate": "2026-05-22T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Realizar configuraciones electronicas para 25 elementos",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-10bb8130 (Historia de México)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-10bb8130-db72-4909-bdd8-51f5f89d053b",
    "unitId": "UNIT-2f311d26-3585-4433-939f-f98de50440a9",
    "title": "Culturas Prehispanicas",
    "description": "Cuadro comparativo de culturas mesoamericanas",
    "dueDate": "2026-05-14T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Elaborar un cuadro comparativo de 4 culturas",
    "attachments": [],
    "links": ["https://es.wikipedia.org/wiki/Historia"],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-86a9ece6 (Conversación en Inglés)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-86a9ece6-16c0-4c44-a481-bb6985524feb",
    "unitId": "UNIT-f0f6a8b2-2e8a-4f11-b0c8-56d2f91b6231",
    "title": "Grabacion de Conversacion",
    "description": "Grabar un dialogo en ingles",
    "dueDate": "2026-06-08T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Realizar una grabacion de audio de 2 minutos",
    "attachments": [],
    "links": [],
    "targetType": "PAIR",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-bc8694c2 (Cálculo Diferencial)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-bc8694c2-bef8-4d9f-9d92-714e3a11f0ef",
    "unitId": "UNIT-0b8efbd6-f5b1-469f-9ede-852e43717700",
    "title": "Limites y Continuidad",
    "description": "Calcular limites algebraicos",
    "dueDate": "2026-06-12T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Resolver 20 ejercicios de limites",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-22479f39 (Inglés de Negocios)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-22479f39-2471-40e4-a95b-cacdd631bc89",
    "unitId": "UNIT-04c29fd6-064a-439b-9723-1495f69952b8",
    "title": "Email de Negocios",
    "description": "Redactar un correo profesional",
    "dueDate": "2026-05-27T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Redactar un email formal",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-1fbeab22 (Biología General)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-1fbeab22-1ce9-4370-8407-162935356be0",
    "unitId": "UNIT-266ea22e-1510-4639-9a24-6c0c10a7684b",
    "title": "Estructura Celular",
    "description": "Identificar organelos celulares",
    "dueDate": "2026-05-19T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Dibujar una celula animal y una vegetal",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-49f76ea9 (Desarrollo Web)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-49f76ea9-984e-4d2f-b5e5-9f4202151905",
    "unitId": "UNIT-5b81ce19-eeff-4d0e-822d-0af985733bae",
    "title": "Landing Page Responsive",
    "description": "Crear una pagina web responsive",
    "dueDate": "2026-06-22T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Desarrollar una landing page con HTML5 y CSS3",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-6b67c23d
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-6b67c23d-00ba-4b26-8a62-e0735ef19ec5",
    "unitId": "UNIT-431bf7de-d6b6-4030-ab21-22659fd0973d",
    "title": "Ejercicio Practico",
    "description": "Resolver ejercicios del temario",
    "dueDate": "2026-06-30T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Completar todos los ejercicios de la unidad",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-f0354d05 (Ecología)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-f0354d05-5d88-48e6-ba09-6596822150bf",
    "unitId": "UNIT-a7469cfb-1a24-4dba-80f6-bfb57936b0d6",
    "title": "Cadena Alimenticia",
    "description": "Construir una red trofica",
    "dueDate": "2026-05-16T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Investigar un ecosistema y dibujar su red trofica",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-29fafcf6 (Cartografía Digital)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-29fafcf6-21ec-4e80-89e9-52d8d67cf578",
    "unitId": "UNIT-6becb64b-8e8a-4886-9f8e-3bca459d4eb6",
    "title": "Mapa Tematico",
    "description": "Crear un mapa en QGIS",
    "dueDate": "2026-06-28T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Generar un mapa tematico con capas vectoriales",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-975d70c8 (Geografía de México)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-975d70c8-816c-4aea-a7eb-d395c2a99274",
    "unitId": "UNIT-c383560a-8e83-4c59-84c2-40efa5abc891",
    "title": "Regiones Geograficas",
    "description": "Identificar las regiones de Mexico",
    "dueDate": "2026-05-13T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Elaborar un mapa de Mexico con las regiones geograficas",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-efebfe02 (Geografía Urbana)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-efebfe02-99ba-488a-948e-c0d2bdd40622",
    "unitId": "UNIT-776540ec-b410-460a-a797-f3896499c84c",
    "title": "Analisis Urbano",
    "description": "Analizar crecimiento urbano",
    "dueDate": "2026-06-07T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Analizar la expansion urbana de una ciudad",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

sleep 1

# COURSE-d3323523 (Ciencia de Datos)
curl -X POST http://localhost:8080/api/assignments/frontend \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE-d3323523-5dcc-4e3f-b16a-ef784b9b7be8",
    "unitId": "UNIT-a9766cb4-6d87-4cad-bfe8-84c8f8d4735f",
    "title": "Analisis Exploratorio",
    "description": "Realizar EDA con Pandas",
    "dueDate": "2026-06-17T23:59:00Z",
    "maxPoints": 100,
    "instructions": "Cargar un dataset y generar visualizaciones",
    "attachments": [],
    "links": [],
    "targetType": "INDIVIDUAL",
    "submissionFormat": "DIGITAL"
  }'

