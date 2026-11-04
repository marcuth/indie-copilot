import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LuPlus, LuX } from "react-icons/lu"

interface TagInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function TagInput({
    value = [],
    onChange,
    placeholder = "Digite e pressione Enter...",
    disabled = false,
    className,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("")

    const handleAdd = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setInputValue("")
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAdd()
        }
    }

    const handleRemove = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    return (
        <div className={`flex flex-col gap-2 ${className ?? ""}`}>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 text-sm"
                />
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAdd}
                    disabled={disabled || !inputValue.trim()}
                    className="shrink-0"
                >
                    <LuPlus className="mr-1 h-3.5 w-3.5" />
                    Adicionar
                </Button>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {value.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-normal"
                        >
                            <span>{tag}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(tag)}
                                    className="hover:text-destructive transition-colors focus:outline-none"
                                    aria-label={`Remover ${tag}`}
                                >
                                    <LuX className="h-3 w-3" />
                                </button>
                            )}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
