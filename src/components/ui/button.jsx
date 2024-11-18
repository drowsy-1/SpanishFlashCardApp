import React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                {
                    "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
                    "border border-input hover:bg-accent hover:text-accent-foreground": variant === "outline",
                },
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export default Button
export { Button }