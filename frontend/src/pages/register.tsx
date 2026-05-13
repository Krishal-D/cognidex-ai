import Button from "../components/ui/Button"
import Input from "../components/ui/input"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import type { RegisterFormData } from "../types/component"
import { Link } from "react-router-dom"

export function Register() {

    const initialForm: RegisterFormData = {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    }

    const { register } = useAuth()
    const [form, setForm] = useState<RegisterFormData>(initialForm)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            await register(form.name, form.email, form.password)
            setForm(initialForm)

        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed')
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

                <h2 className="text-2xl text-center font-bold p-2">Create Account</h2>
                <h3 className="text-sm text-zinc-400 mb-4">Start asking questions about your documents</h3>

                {error && (
                    <p className="text-red-400 text-sm w-full text-center bg-red-950 p-2 rounded-lg">
                        {error}
                    </p>
                )}


                <Input
                    id="name"
                    name="name"
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                />
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

                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="********"
                    value={form.confirmPassword}
                    onChange={handleChange}
                />
                <p className="text-sm text-zinc-400">By creating an account, you agree to our <a href="#" className="text-indigo-500 transition-all duration-300 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-500 transition-all duration-300 hover:underline">Privacy Policy</a>.</p>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </Button>


            </form>
            <p className="text-zinc-400 m-4">Already Have an account? {" "}
                <Link
                    to="/login"
                    className="text-indigo-500 hover:underline transition-all duration-300"
                >
                    Sign in
                </Link>
            </p>

        </div>
    )

}