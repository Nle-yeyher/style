import pool from '@/lib/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  createdAt?: Date;
  updatedAt?: Date;
}

function rowToUser(row: RowDataPacket): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'customer',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class UserDocument {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  updatedAt: Date;

  constructor(data: User) {
    this.id       = data.id;
    this.name     = data.name;
    this.email    = data.email;
    this.password = data.password;
    this.role     = data.role || 'customer';
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

  async findByIdLean(id: string | number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return null;
    return rowToUser(rows[0]);
  },

  async create(data: { name: string; email: string; password: string }): Promise<UserDocument> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [data.name, data.email, data.password, 'customer']
    );
    const inserted: User = { id: result.insertId, role: 'customer', ...data };
    return new UserDocument(inserted);
  },
};

export default UserModel;
