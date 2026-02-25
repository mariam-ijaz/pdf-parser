import app from './app.js';
import { config } from './index.js'; 


const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use`);
    process.exit(1);
  }
});


['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
});