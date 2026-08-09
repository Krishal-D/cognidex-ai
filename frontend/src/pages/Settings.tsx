import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineSparkles } from "react-icons/hi";
import axios from "axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";

function Settings() {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const nameChanged = name.trim() !== "" && name.trim() !== user?.name;

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!nameChanged) return;

        setSaving(true);
        setError(null);
        setSaved(false);

        try {
            await updateProfile(name.trim());
            setSaved(true);
        } catch (err) {
            const message = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            setError(message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <header className="flex items-center gap-3 p-5 border-b border-[#E5E2DC] bg-white">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-sm text-[#8A8680] hover:text-[#1A1A1A] transition-colors"
                >
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </header>

            <main className="flex justify-center px-4 py-10">
                <div className="w-full max-w-md flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E2DC] flex items-center justify-center">
                            <HiOutlineSparkles className="w-4 h-4 text-[#16A34A]" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-[#1A1A1A]">Account Settings</h1>
                            <p className="text-xs text-[#8A8680]">Manage your profile</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSave}
                        className="flex flex-col bg-white border border-[#E5E2DC] p-6 gap-5 rounded-xl shadow-sm"
                    >
                        {error && (
                            <p className="text-red-500 text-sm w-full text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                                {error}
                            </p>
                        )}

                        {saved && (
                            <p className="text-[#16A34A] text-sm w-full text-center bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                                Profile updated.
                            </p>
                        )}

                        <Input
                            id="name"
                            name="name"
                            label="Display Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSaved(false);
                            }}
                        />

                        <Input
                            id="email"
                            name="email"
                            label="Email"
                            value={user?.email ?? ""}
                            disabled
                        />
                        <p className="-mt-3 text-xs text-[#8A8680]">
                            Email changes aren't supported yet.
                        </p>

                        <Button type="submit" disabled={saving || !nameChanged}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>

                    <div className="bg-white border border-[#E5E2DC] p-6 rounded-xl shadow-sm">
                        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-1">Session</h2>
                        <p className="text-xs text-[#8A8680] mb-4">
                            Sign out of Cognidex on this device.
                        </p>
                        <Button variant="danger" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Settings;
