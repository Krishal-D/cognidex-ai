export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
}

export interface InputProps {
    type?: string,
    value?: string,
    placeholder?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

