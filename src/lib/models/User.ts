import pool from '@/lib/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function rowToUser(row: RowDataPacket): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Clase que imita la interfaz de un documento Mongoose
class UserDocument {
  id: number;
  name: string;
  email: string;
  password: string;
  updatedAt: Date;

  constructor(data: User) {
    this.id    = data.id;
    this.name  = data.name;
    this.email = data.email;
    this.password = data.password;
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    await pool.execute(
      'UPDATE users SET name = ?, password = ?, updated_at = ? WHERE id = ?',
      [this.name, this.password, this.updatedAt, this.id]
    );
  }
}

const UserModel = {

  async findOne(filter: { email?: string }): Promise<UserDocument | null> {
    if (filter.email) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [filter.email]
      );
      if (!rows.length) return null;
      return new UserDocument(rowToUser(rows[0]));
    }
    return null;
  },

  async findById(id: string | number): Promise<UserDocument | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return null;
    return new UserDocument(rowToUser(rows[0]));
  },

  // lean() devuelve el objeto plano (sin métodos save())
  async findByIdLean(id: string | number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return null;
    return rowToUser(rows[0]);
  },

  // Equivalente a new UserModel(data).save()
  async create(data: { name: string; email: string; password: string }): Promise<UserDocument> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [data.name, data.email, data.password]
    );
    const inserted: User = { id: result.insertId, ...data };
    return new UserDocument(inserted);
  },
};

export default UserModel;
