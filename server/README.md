# Nano Projet API

API Node.js + Express pour le front `nano-projet`.

## Demarrer

```bash
npm install
npm run dev
```

L'API ecoute par defaut sur `http://localhost:3001`.

## Routes

- `GET /api/health` verifie que l'API repond.
- `GET /api/tasks` liste les taches.
- `GET /api/tasks/:id` recupere une tache.
- `POST /api/tasks` cree une tache.
- `PUT /api/tasks/:id` modifie une tache.
- `DELETE /api/tasks/:id` supprime une tache.
