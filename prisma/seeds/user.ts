import { Role } from "@prisma/client";

export const USERS = [
  {
    email: 'admin@bookstore.com',
    name: 'Admin Store',
    id: '598f5a82-8dca-4f1f-9c55-898996159adc',
    role: Role.ADMIN,
    password: '$2b$10$2a2RHdrAAz8R9n40Ui8naOMpalgW2eJqEKG/I8Pa.mKkeZAxRX2u2'
  },
  {
    email: 'john@gmail.com',
    name: 'John Doe',
    id: 'a34242ad-07a3-4a59-8703-30d1a49210c3',
    role: Role.USER,
    password: '$2b$10$2a2RHdrAAz8R9n40Ui8naOMpalgW2eJqEKG/I8Pa.mKkeZAxRX2u2'
  }
]
