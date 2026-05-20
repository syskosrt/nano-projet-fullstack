# API

Base URL locale: `http://localhost:3001`

## Health

```http
GET /api/health
```

Reponse:

```json
{
  "status": "ok",
  "service": "nano-projet-api"
}
```

## Tasks

### Lister

```http
GET /api/tasks
```

### Lire une tache

```http
GET /api/tasks/:id
```

### Creer

```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "title": "Nouvelle tache",
  "description": "Details optionnels",
  "completed": false
}
```

### Modifier

```http
PUT /api/tasks/:id
Content-Type: application/json
```

```json
{
  "title": "Tache mise a jour",
  "description": "Details optionnels",
  "completed": true
}
```

### Supprimer

```http
DELETE /api/tasks/:id
```
