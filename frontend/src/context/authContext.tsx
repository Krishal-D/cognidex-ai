import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { authAPI } from "../api/auth";
import type { AuthContextType, User } from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [accessToken, setAccessToken] = useState<string | null>(null)


    const register = async (name: string, email: string, password: string) => {
        setLoading(true)

        try {
            const data = await authAPI.register(name, email, password)
            setAccessToken(data.token)
            setUser(data.user)

            return data

        } catch (error) {
            setError('Register Failed')
            throw error

        } finally {
            setLoading(false)
        }

    }


    const login = async (email: string, password: string) => {
        setLoading(true)

        try {
            const data = await authAPI.login(email, password)
            setAccessToken(data.token)
            setUser(data.user)
            return data


        } catch (error) {
            setError('Login Failed')

        } finally {
            setLoading(false)
        }

    }


    const logout = async () => {
        setLoading(true)

        try {
            await authAPI.logout()
            setAccessToken(null)
            setUser(null)

        } catch (error) {
            setError('Logout Failed')

        } finally {
            setLoading(false)
        }
    }

    const refresh = async () => {

        try {
            const data = await authAPI.refresh()
            setAccessToken(data.token)
            setUser(data.user)
        } catch (error) {
            setAccessToken(null)
            setUser(null)
        }
    }


    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            loading,
            error,
            register,
            login,
            logout,
            refresh,
        }}>
            {children}
        </AuthContext.Provider>
    )

}