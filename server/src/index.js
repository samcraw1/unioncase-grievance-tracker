import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { initializeScheduler } from './services/notificationScheduler.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV !== 'production') {
    initializeScheduler();
  }
});
