import express, { Application } from 'express';
import helmet from 'helmet';

import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import financialAnalysisRoutes from './routes/financialAnalysis.routes';
import adminRoutes from './routes/admin.routes';
import verificationRoutes from './routes/verification.routes';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';

const app: Application = express();

app.set("trust proxy", 1);
app.use(helmet());
import cors from "cors";

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);
      const allowedOrigins = [
        "http://localhost:5173",
        "https://dnh-frontend-mauve.vercel.app",
        "https://dnh-frontend-iqtdkztyp-info2sumitkumar-2476s-projects.vercel.app",
        "https://www.dnhfintech.com/",
        "http://localhost:8443",
        "https://www.dnhfintech.com",
        
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(globalRateLimiter);
app.use('/financial-analysis', financialAnalysisRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', verificationRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'DNH backend is healthy', data: { timestamp: new Date().toISOString() } });
});



app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
