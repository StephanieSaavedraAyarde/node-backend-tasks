# Task Manager | Backend
El proyecto desarrollado es un sistema de gestión de tareas, donde se tiene los siguientes elementos:
- Autenticación para el ingreso al sistema
- Recuperación de tareas registradas por usuario
- Listado de tareas
- Opción a crear nuevas tareas
- Opción a editar tareas
- Opción a eliminar tareas
- Opción a marcar la tarea como Completa
- Opción a marcar la tarea como Pendiente

## Planificación de endpoints.
- Listado: GET /tasks
- Obtener una tarea: GET /tasks/{id}
- Crear: POST /tasks
- Editar: PUT /tasks/{id}
- Eliminar: DELETE /tasks/{id} 
- Marcar completado:  PUT /tasks/{id}?state=completed
- Marcar pendiente: PUT /tasks/{id}?state=pending
    
