export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    refresh_token?: string;
    created_at?: Date;
}

export interface IUserModel {
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: number): Promise<User | null>;
    createUser(name: string, email: string, password: string): Promise<User>;
    updateRefreshToken(id: number, refresh_token: string): Promise<void>;
    removeRefreshToken(id: number): Promise<void>;
}