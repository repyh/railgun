import React, { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
    open: boolean
    setOpen: (open: boolean) => void
    value: string
    onValueChange: (value: string) => void
    disabled?: boolean
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const Select: React.FC<{
    value: string
    onValueChange: (value: string) => void
    disabled?: boolean
    children: React.ReactNode
}> = ({ value, onValueChange, disabled, children }) => {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)

    return (
        <SelectContext.Provider value={{ open, setOpen, value, onValueChange, disabled, triggerRef }}>
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

    const handleRef = (node: HTMLButtonElement | null) => {
        (context.triggerRef as any).current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as any).current = node
    }

    return (
        <button
            ref={handleRef}
            type="button"
            onClick={() => !context.disabled && context.setOpen(!context.open)}
            disabled={context.disabled || props.disabled}
            className={cn(
                "flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <div className="flex-1 text-left truncate mr-2">
                {children}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
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

    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })

    useLayoutEffect(() => {
        if (context.open && context.triggerRef.current) {
            const rect = context.triggerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: rect.width
            })
        }
    }, [context.open, context.triggerRef])

    if (!context.open) return null

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999]" onClick={() => context.setOpen(false)} />
            <div
                style={{
                    position: 'fixed',
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    zIndex: 10000
                }}
                className={cn(
                    "mt-1 max-h-60 overflow-auto rounded-md border-zinc-800 bg-zinc-950/95 backdrop-blur-xl border text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95",
                    className
                )}
            >
                <div className="p-1">
                    {children}
                </div>
            </div>
        </>,
        document.body
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
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-zinc-800 transition-colors",
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
