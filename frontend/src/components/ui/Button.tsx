import type { ButtonProps } from "../../types/component";

export default function button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
}: ButtonProps) {
    const baseStyle =
        "px-4 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-black hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]}`}>
            {children}
        </button >

        
    )
}