import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, '..', 'data', 'tasks.json')
const port = Number(process.env.PORT) || 3001

const app = express()
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())
app.use(morgan('dev'))

async function readTasks() {
  const content = await readFile(dataFile, 'utf8')
  return JSON.parse(content)
}

async function writeTasks(tasks) {
  await mkdir(path.dirname(dataFile), { recursive: true })
  await writeFile(dataFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8')
}

function sanitizeTaskInput(body) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    description: typeof body.description === 'string' ? body.description.trim() : '',
    completed: Boolean(body.completed),
  }
}

function sendNotFound(response) {
  response.status(404).json({ message: 'Tache introuvable.' })
}

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', service: 'nano-projet-api' })
})

app.get('/', (request, response) => {
  response.json({
    service: 'nano-projet-api',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      tasks: '/api/tasks',
    },
  })
})

app.get('/api/tasks', async (request, response, next) => {
  try {
    const tasks = await readTasks()
    response.json(tasks)
  } catch (error) {
    next(error)
  }
})

app.get('/api/tasks/:id', async (request, response, next) => {
  try {
    const tasks = await readTasks()
    const task = tasks.find((item) => item.id === request.params.id)

    if (!task) {
      sendNotFound(response)
      return
    }

    response.json(task)
  } catch (error) {
    next(error)
  }
})

app.post('/api/tasks', async (request, response, next) => {
  try {
    const input = sanitizeTaskInput(request.body)

    if (!input.title) {
      response.status(400).json({ message: 'Le titre est obligatoire.' })
      return
    }

    const now = new Date().toISOString()
    const task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      completed: input.completed,
      createdAt: now,
      updatedAt: now,
    }

    const tasks = await readTasks()
    const nextTasks = [task, ...tasks]
    await writeTasks(nextTasks)

    response.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

app.put('/api/tasks/:id', async (request, response, next) => {
  try {
    const input = sanitizeTaskInput(request.body)

    if (!input.title) {
      response.status(400).json({ message: 'Le titre est obligatoire.' })
      return
    }

    const tasks = await readTasks()
    const taskIndex = tasks.findIndex((item) => item.id === request.params.id)

    if (taskIndex === -1) {
      sendNotFound(response)
      return
    }

    const updatedTask = {
      ...tasks[taskIndex],
      title: input.title,
      description: input.description,
      completed: input.completed,
      updatedAt: new Date().toISOString(),
    }

    const nextTasks = [...tasks]
    nextTasks[taskIndex] = updatedTask
    await writeTasks(nextTasks)

    response.json(updatedTask)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/tasks/:id', async (request, response, next) => {
  try {
    const tasks = await readTasks()
    const nextTasks = tasks.filter((item) => item.id !== request.params.id)

    if (nextTasks.length === tasks.length) {
      sendNotFound(response)
      return
    }

    await writeTasks(nextTasks)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ message: 'Erreur serveur.' })
})

app.listen(port, () => {
  console.log(`API disponible sur http://localhost:${port}`)
})
