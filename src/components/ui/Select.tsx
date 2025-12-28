import React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
    open: boolean
    setOpen: (open: boolean) => void
    value: string
    onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const Select: React.FC<{
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
}> = ({ value, onValueChange, children }) => {
    const [open, setOpen] = React.useState(false)

    return (
        <SelectContext.Provider value={{ open, setOpen, value, onValueChange }}>
            <div className="relative inline-block w-full text-left">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => context.setOpen(!context.open)}
            className={cn(
                "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<{ placeholder?: string; className?: string }> = ({ placeholder, className }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    return (
        <span className={cn("block truncate", className)}>
            {context.value || placeholder}
        </span>
    )
}

const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    if (!context.open) return null

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
            <div className={cn(
                "absolute right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border-zinc-800 bg-zinc-900 border text-popover-foreground shadow-md animate-in fade-in-80",
                className
            )}>
                <div className="p-1">
                    {children}
                </div>
            </div>
        </>
    )
}

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const isSelected = context.value === value

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-zinc-800",
                isSelected && "bg-zinc-800/50",
                className
            )}
            onClick={() => {
                context.onValueChange(value)
                context.setOpen(false)
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4 text-blue-500" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
