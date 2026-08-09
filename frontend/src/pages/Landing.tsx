import { Navigate, Link } from "react-router-dom";
import { HiOutlineSparkles, HiOutlineUpload, HiOutlineChatAlt2, HiOutlineDocumentSearch } from "react-icons/hi";
import { useAuth } from "../hooks/useAuth";

const features = [
    {
        icon: HiOutlineUpload,
        title: "Upload a PDF",
        description: "Drop in a document and it's parsed, chunked, and embedded automatically.",
    },
    {
        icon: HiOutlineChatAlt2,
        title: "Ask anything",
        description: "Chat with your document in plain language, one conversation per document.",
    },
    {
        icon: HiOutlineDocumentSearch,
        title: "Grounded answers",
        description: "Every answer is backed by retrieved passages, with sources you can inspect.",
    },
];

function Landing() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8F7F4]">
                <p className="text-[#8A8680] text-sm">Loading...</p>
            </div>
        );
    }

    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E2DC] flex items-center justify-center">
                        <HiOutlineSparkles className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <h1 className="font-bold text-lg text-[#1A1A1A]">
                        Cogni<span className="text-[#16A34A]">dex</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-[#3D3D3D] hover:text-[#1A1A1A] transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="text-sm font-medium text-white bg-[#16A34A] hover:bg-[#15803d] transition-colors px-4 py-2 rounded-xl"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight">
                    Ask your documents<br />anything.
                </h2>
                <p className="mt-5 text-lg text-[#8A8680] max-w-xl">
                    Upload a PDF and get grounded, cited answers — powered by retrieval-augmented
                    generation, not guesswork.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/register"
                        className="px-6 py-3 rounded-xl font-medium text-white bg-[#16A34A] hover:bg-[#15803d] transition-all active:scale-[0.985]"
                    >
                        Get Started — it's free
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-3 rounded-xl font-medium text-[#1A1A1A] bg-white border border-[#E5E2DC] hover:bg-gray-50 transition-all"
                    >
                        Sign In
                    </Link>
                </div>

                <div className="mt-20 grid sm:grid-cols-3 gap-6 w-full text-left">
                    {features.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            className="bg-white border border-[#E5E2DC] rounded-xl p-5 flex flex-col gap-3"
                        >
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-[#16A34A]" />
                            </div>
                            <h3 className="font-semibold text-sm text-[#1A1A1A]">{title}</h3>
                            <p className="text-sm text-[#8A8680] leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Landing;
