import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectdb } from './src/db/connect.js'
import usersRouter from './src/routes/users.routes.js'
import adminRouter from './src/routes/admin.routes.js'
import complaintRouter from './src/routes/complaint.routes.js'
import { errorHandler } from './src/middlewares/error.middleware.js'


dotenv.config()

const app = express()


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})
app.get('/', (req, res) => {
    res.send('API is running...RRSERVICES12')
})

const PORT = process.env.PORT || 5000

// Mount routes
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/complaints', complaintRouter)

// Error handling middleware
app.use(errorHandler)

// Start server after DB connects
const start = async () => {
    try {
        await connectdb()
        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`)
        })
    } catch (err) {
        console.error('Failed to start server:', err)
        process.exit(1)
    }
}

start()

