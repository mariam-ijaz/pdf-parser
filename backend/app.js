
import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/Analyzepdfroutes.js';
import dotenv from 'dotenv';


dotenv.config();

const app = express();


app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', pdfRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

export default app;