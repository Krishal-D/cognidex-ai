import type { InputProps } from "../../types/component";

export default function Input({
    id,
    name,
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    disabled = false,
}: InputProps) {
    const baseStyle =
        "w-full px-4 py-2 border rounded-xl border-neutral-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50";

    return (
        <div className="flex flex-col gap-2 w-full m-3">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-zinc-50">
                    {label}
                </label>
            )}

            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={baseStyle}
            />
        </div>
    )
}
