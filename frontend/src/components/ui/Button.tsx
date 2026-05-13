import type { ButtonProps } from "../../types/component";

export default function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
}: ButtonProps) {
    const baseStyle =
        "px-4 py-2 w-full rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-indigo-500 text-white transition-all duration-300 hover:scale-95 hover:bg-indigo-600",
        secondary: "bg-gray-200 text-black hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]}`}>
            {children}
        </button >

        
    )
}