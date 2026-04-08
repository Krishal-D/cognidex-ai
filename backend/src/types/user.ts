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
    verifyRefreshToken(id: number, refreshToken: string): Promise<User | null>;
}

export interface AuthUser {
    user: {
        id: number,
        name: string,
        email: string
    },
    refreshToken: string;
    accessToken: string;
}

export interface RefreshTokens {
    newAccessToken: string;
    newRefreshToken: string;
}