import type { InputProps } from "../../types/component";

export default function Input({
    type = "text",
    placeholder = "",
    value,
    onChange,
    disabled = false,
}: InputProps) {
    const baseStyle =
        "w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50";

    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={baseStyle}
        />
    );
}