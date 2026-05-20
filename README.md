# Nano Projet Fullstack

Application full-stack avec un front React/Vite et une API Node.js/Express.

Le projet contient un CRUD classique de taches:

- creation
- lecture
- modification
- suppression
- statut terminee/en cours

## Stack

- React 19
- Vite
- Express
- Node.js
- Stockage JSON local

## Structure

```text
nano-projet-fullstack/
  client/   # application React
  server/   # API Express
  docs/     # documentation API
```

## Installation

```bash
npm install
```

## Lancer le projet

Dans un terminal:

```bash
npm run dev:server
```

Dans un autre terminal:

```bash
npm run dev:client
```

URLs locales:

- Front: `http://localhost:5173`
- API: `http://localhost:3001`
- Healthcheck: `http://localhost:3001/api/health`

## Scripts

```bash
npm run dev:client
npm run dev:server
npm run build
npm run lint
npm run start
```

## Variables d'environnement

Des exemples sont fournis dans:

- `.env.example`
- `client/.env.example`
- `server/.env.example`

Par defaut, le front appelle `http://localhost:3001/api`.

## Documentation

La documentation des routes API est disponible dans `docs/api.md`.
