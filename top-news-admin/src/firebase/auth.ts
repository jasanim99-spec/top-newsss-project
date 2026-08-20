import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence).catch((err) => console.error('Persistence error:', err));

