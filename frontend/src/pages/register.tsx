import Button from "../components/ui/Button";
import Input from "../components/ui/input";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { RegisterFormData } from "../types/component";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export function Register() {
    const initialForm: RegisterFormData = {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    };

    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState<RegisterFormData>(initialForm);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await register(form.name, form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            const message = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            setError(message || 'Registration failed');
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
                    <h2 className="text-2xl font-bold mt-4">Create Account</h2>
                    <h3 className="text-sm text-[#8A8680] mt-1">
                        Start asking questions about your documents
                    </h3>
                </div>

                {error && (
                    <p className="text-red-500 text-sm w-full text-center bg-red-50 border border-red-200 p-3 rounded-lg">
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
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                />

                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                />

                <p className="text-xs text-[#8A8680] text-center">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-[#16A34A] hover:underline">Terms of Service</a> and{" "}
                    <a href="#" className="text-[#16A34A] hover:underline">Privacy Policy</a>.
                </p>

                <Button type="submit" disabled={loading} >
                    {loading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>

            <p className="text-[#8A8680] m-4 text-sm">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-[#16A34A] hover:underline font-medium"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}