import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authAPI } from "../api/auth";
import type { User } from "../types";
import { AuthContext } from "./AuthContextObject";

export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [accessToken, setAccessToken] = useState<string | null>(null)


    const register = async (name: string, email: string, password: string) => {
        setLoading(true)

        try {
            const data = await authAPI.register(name, email, password)
            setAccessToken(data.token)
            setUser(data.user)
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
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
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            return data


        } catch (error) {
            setError('Login Failed')
            throw error

        } finally {
            setLoading(false)
        }

    }


    const logout = async () => {
        setLoading(true)

        try {
            await authAPI.logout()
        } catch {
            // Best-effort: clear local session state below regardless of server response
        } finally {
            setAccessToken(null)
            setUser(null)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setLoading(false)

        }
    }

    const refresh = async () => {

        try {
            const data = await authAPI.refresh()
            setAccessToken(data.token)
            setUser(data.user)
        } catch {
            setAccessToken(null)
            setUser(null)
        }
    }

    const updateProfile = async (name: string) => {
        setLoading(true)

        try {
            const data = await authAPI.updateProfile(name)
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
        } catch (error) {
            setError('Failed to update profile')
            throw error

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        if (savedToken && savedUser) {
            setAccessToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

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
            updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    )

}