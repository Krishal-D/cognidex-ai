import Button from "../components/ui/Button"
import Input from "../components/ui/input"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import type { LoginFormData } from "../types/component"
import { Link } from "react-router-dom"

export function Login() {

    const initialForm: LoginFormData = {
        email: "",
        password: "",
    }

    const { login } = useAuth()
    const [form, setForm] = useState<LoginFormData>(initialForm)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)


        setLoading(true)

        try {
            await login(form.email, form.password)
            setForm(initialForm)

        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }


    }


    return (
        <div className="flex flex-col min-h-screen justify-center items-center ">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md flex flex-col justify-center items-center bg-[#1A1A1A] p-8  gap-4 rounded-xl"
            >
                <h1 className="font-bold pb-4 text-center text-2xl">DocuSense <span className="text-indigo-500">AI</span></h1>


                {error && (
                    <p className="text-red-400 text-sm w-full text-center bg-red-950 p-2 rounded-lg">
                        {error}
                    </p>
                )}

                <Input
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                />
                <Input
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="********"
                    value={form.password}
                    onChange={handleChange}
                />

                <div className="flex justify-end w-full mb-2">
                    <a
                        href="#"
                        className="text-sm text-zinc-400 hover:text-indigo-400 transition-all duration-300"
                    >
                        Forgot Password?
                    </a>
                </div>                <Button type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>


            </form>
            <p className="text-zinc-400 m-4">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    className="text-indigo-500 hover:underline transition-all duration-300"
                >
                    Register
                </Link>
            </p>
        </div>
    )

}