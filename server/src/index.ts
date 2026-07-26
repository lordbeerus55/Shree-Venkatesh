import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { requireAuth } from './middleware/auth'

import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import marketRoutes from './routes/markets'
import gameRateRoutes from './routes/gameRates'
import resultRoutes from './routes/results'
import bidRoutes from './routes/bids'
import walletRoutes from './routes/wallet'
import depositRoutes from './routes/deposits'
import withdrawalRoutes from './routes/withdrawals'
import reportRoutes from './routes/reports'
import notificationRoutes from './routes/notifications'
import sliderRoutes from './routes/slider'
import settingRoutes from './routes/settings'
import contentRoutes from './routes/contents'
import paymentRoutes from './routes/payments'
import timingRoutes from './routes/timings'

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.FRONTEND_URL || ''
].filter(Boolean)

// If FRONTEND_URL is not set in production, allow all origins (fallback)
const corsConfig = process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
  ? {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  : {
      origin: true, // Allow all origins in development or if FRONTEND_URL not set
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    }

app.use(cors(corsConfig))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')))

app.use('/api/auth', authRoutes)

app.use('/api/users', requireAuth, userRoutes)
app.use('/api/markets', requireAuth, marketRoutes)
app.use('/api/game-rates', requireAuth, gameRateRoutes)
app.use('/api/results', requireAuth, resultRoutes)
app.use('/api/bids', requireAuth, bidRoutes)
app.use('/api/wallet', requireAuth, walletRoutes)
app.use('/api/deposits', requireAuth, depositRoutes)
app.use('/api/withdrawals', requireAuth, withdrawalRoutes)
app.use('/api/reports', requireAuth, reportRoutes)
app.use('/api/notifications', requireAuth, notificationRoutes)
app.use('/api/slider', requireAuth, sliderRoutes)
app.use('/api/settings', requireAuth, settingRoutes)
app.use('/api/contents', requireAuth, contentRoutes)
app.use('/api/payments', requireAuth, paymentRoutes)
app.use('/api/timings', requireAuth, timingRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
