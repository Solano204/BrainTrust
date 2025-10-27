# 🎓 Education Platform Frontend

Plataforma educativa con detección de IA utilizando arquitectura hexagonal y Clean Architecture.

## 🏗️ Arquitectura

Este proyecto sigue los principios de **Arquitectura Hexagonal (Ports & Adapters)** y  **Clean Architecture** :

```
src/
├── app/              # Application Layer (Configuración)
├── core/             # Domain Layer (Entidades y lógica de negocio)
├── infrastructure/   # Infrastructure Layer (Implementaciones)
├── application/      # Application Layer (Casos de uso)
├── presentation/     # Presentation Layer (UI)
└── shared/           # Shared Utilities (crosscutting)
```

## 🚀 Tecnologías

* **React 18** - Librería UI
* **TypeScript** - Tipado estático
* **Vite** - Build tool
* **React Router DOM** - Enrutamiento
* **Tailwind CSS** - Estilos
* **Axios** - Cliente HTTP
* **Zustand** - Estado global
* **React Hook Form + Zod** - Formularios y validación

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.development

# Iniciar servidor de desarrollo
npm run dev
```

## 🛠️ Comandos Disponibles

```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm run preview    # Vista previa de la build
npm run lint       # Ejecutar linter
npm run format     # Formatear código
```

## 🎯 Features

* ✅ Autenticación de usuarios (Estudiantes y Profesores)
* ✅ Gestión de cursos
* ✅ Gestión de tareas/asignaciones
* ✅ Sistema de entregas
* ✅ Detección de contenido generado por IA
* ✅ Panel de calificaciones
* ✅ Perfiles de usuario

## 📁 Estructura de Capas

### 🎯 App Layer

Configuración de la aplicación, providers y enrutamiento.

### 🏛️ Core Layer (Domain)

* **Entities** : Modelos de dominio
* **Value Objects** : Objetos inmutables
* **Enums** : Enumeraciones del dominio
* **Ports** : Interfaces (contratos)

### 🔧 Infrastructure Layer

* **API Client** : Configuración de Axios
* **Repositories** : Implementaciones de repositorios
* **Mappers** : Conversión entre DTOs y Entities
* **Services** : Servicios externos (storage, etc.)

### 💼 Application Layer

* **Use Cases** : Lógica de aplicación
* **Services** : Orquestación de casos de uso

### 🎨 Presentation Layer

* **Components** : Componentes React (common, layout, features)
* **Pages** : Páginas/Contenedores
* **Hooks** : Custom hooks
* **Context** : React Context (estado global)

### 🛠️ Shared

Utilidades compartidas, constantes, tipos y errores.

## 🔐 Variables de Entorno

Las variables de entorno están definidas en archivos `.env.*`:

* `.env.example` - Template
* `.env.development` - Desarrollo
* `.env.production` - Producción

## 📝 Convenciones de Código

* **Nomenclatura** : PascalCase para componentes, camelCase para funciones
* **Imports** : Path aliases configurados (@app, @core, @presentation, etc.)
* **Estilos** : Tailwind CSS utility-first
* **Tipos** : TypeScript strict mode habilitado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

* Nombre - Desarrollo inicial

---
