import { pool } from "../config/db"
import { IUserModel, User } from "../types/user"

export const userModel: IUserModel = {

    async findUserByEmail(email: string): Promise<User | null> {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1 `, [email])
        return result.rows[0] || null
    },

    async findUserById(id: number): Promise<User | null> {
        const result = await pool.query(`SELECT id,name,email FROM users WHERE id = $1 `, [id])
        return result.rows[0] || null
    },

    async createUser(name: string, email: string, password: string): Promise<User> {
        const result = await pool.query(`
            INSERT INTO users (name,email,password) 
            VALUES($1,$2,$3)
            RETURNING id,name,email,created_at
            `, [name, email, password])

        return result.rows[0]
    },

    async updateRefreshToken(id: number, refresh_token: string): Promise<void> {
        await pool.query(`
            UPDATE users
            SET refresh_token = $1
            WHERE id = $2
            `, [refresh_token, id])

    },

    async removeRefreshToken(id: number): Promise<void> {
        await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [id])
    }




}