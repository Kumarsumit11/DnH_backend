import { Role } from '../constants/roles';

declare global {
  namespace Express {
    interface Request {
      account?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
