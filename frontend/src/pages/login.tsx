import Button from "../components/ui/Button";
import Input from "../components/ui/input";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { LoginFormData } from "../types/component";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Login() {
    const initialForm: LoginFormData = {
        email: "",
        password: "",
    };

    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState<LoginFormData>(initialForm);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            const message = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            setError(message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen justify-center items-center bg-[#F8F7F4]">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md flex flex-col bg-white border border-[#E5E2DC] p-8 gap-6 rounded-xl shadow-sm"
            >
                <div className="flex flex-col items-center text-center mb-2">
                    <h1 className="font-bold text-3xl text-[#1A1A1A]">
                        DocuSense <span className="text-[#16A34A]">AI</span>
                    </h1>
                    <h3 className="text-sm text-[#8A8680] mt-2">
                        Sign in to continue
                    </h3>
                </div>

                {error && (
                    <p className="text-red-500 text-sm w-full text-center bg-red-50 border border-red-200 p-3 rounded-lg">
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
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                />

                <div className="flex justify-end w-full">
                    <a
                        href="#"
                        className="text-[#16A34A] hover:underline text-sm"
                    >
                        Forgot Password?
                    </a>
                </div>

                <Button type="submit" disabled={loading} >
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <p className="text-[#8A8680] m-4 text-sm">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    className="text-[#16A34A] hover:underline font-medium"
                >
                    Register
                </Link>
            </p>
        </div>
    );
}