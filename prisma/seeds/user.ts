import { Role } from "@prisma/client";

/**
 * Password: Testing123
 */

export const USERS = [
  {
    id: '598f5a82-8dca-4f1f-9c55-898996159adc',
    email: 'admin@gmail.com',
    name: 'Admin Store',
    role: Role.ADMIN,
    password: '$2b$10$2a2RHdrAAz8R9n40Ui8naOMpalgW2eJqEKG/I8Pa.mKkeZAxRX2u2'
  },
  {
    id: 'a34242ad-07a3-4a59-8703-30d1a49210c3',
    email: 'john@gmail.com',
    name: 'John Doe',
    role: Role.USER,
    password: '$2b$10$2a2RHdrAAz8R9n40Ui8naOMpalgW2eJqEKG/I8Pa.mKkeZAxRX2u2'
  },
  {
    id: '06028e2c-dfe3-45e7-96ea-c781c5eff70b',
    email: 'mark@gmail.com',
    name: 'Mark Zuck',
    role: Role.USER,
    password: '$2b$10$2a2RHdrAAz8R9n40Ui8naOMpalgW2eJqEKG/I8Pa.mKkeZAxRX2u2'
  }
]
