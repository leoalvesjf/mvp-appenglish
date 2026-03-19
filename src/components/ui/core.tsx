import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
        const variants = {
            primary: "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5",
            secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/5",
            outline: "border-2 border-white/10 text-white hover:bg-white/5",
            ghost: "text-white/70 hover:text-white hover:bg-white/5",
            danger: "bg-destructive text-white shadow-lg shadow-destructive/25 hover:bg-destructive/90"
        };
        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg",
            icon: "p-3"
        };
        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

// --- Card ---
export const Card = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
    ({ className, ...props }, ref) => (
        <motion.div
            ref={ref}
            className={cn("glass-card rounded-3xl p-6", className)}
            {...props}
        />
    )
);
Card.displayName = "Card";

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            className={cn(
                "flex w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors",
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
Input.displayName = "Input";

// --- Badge ---
export const Badge = ({ children, variant = 'default', className }: {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'primary';
    className?: string;
}) => {
    const variants = {
        default: "bg-white/10 text-white/80 border-white/10",
        success: "bg-success/20 text-success border-success/30",
        warning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        primary: "bg-primary/20 text-primary border-primary/30"
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", variants[variant], className)}>
            {children}
        </span>
    );
};