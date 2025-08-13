# Backend - Task Manager App

Variables d'environnement (créez un fichier `.env` à la racine de `server/`):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task_manager_app
JWT_SECRET=change_this_secret_in_production
```

Scripts npm:

```
npm run dev    # démarre avec nodemon
npm start      # démarre en mode production
```

Endpoints principaux:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me` (auth)
- PUT `/api/auth/me` (auth)
- POST `/api/auth/change-password` (auth)
- GET `/api/tasks` (auth) avec filtres, recherche, pagination, tri
- GET `/api/tasks/:id` (auth)
- POST `/api/tasks` (auth)
- PUT `/api/tasks/:id` (auth)
- DELETE `/api/tasks/:id` (soft delete)
- POST `/api/tasks/:id/restore`
- DELETE `/api/tasks/:id/permanent`
- POST `/api/tasks/:id/checklist`
- PATCH `/api/tasks/:id/checklist/:itemId`
- DELETE `/api/tasks/:id/checklist/:itemId`
- POST `/api/tasks/bulk/status`
- POST `/api/tasks/bulk/delete`
- GET `/api/tasks/stats/summary`


