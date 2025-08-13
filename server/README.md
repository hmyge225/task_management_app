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
- GET `/api/tasks` (auth)
- GET `/api/tasks/:id` (auth)
- POST `/api/tasks` (auth)
- PUT `/api/tasks/:id` (auth)
- DELETE `/api/tasks/:id` (auth)


