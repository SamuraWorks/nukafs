"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface Option {
  label: string
  value: string
}

interface SearchableSelectProps {
  options: Option[]
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  allowOther?: boolean
  otherPlaceholder?: string
  className?: string
}

export function SearchableSelect({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  allowOther = true,
  otherPlaceholder = "Please specify...",
  className
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isOther, setIsOther] = React.useState(false)
  const [otherValue, setOtherValue] = React.useState("")
  
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // If initial value doesn't match any options and isn't empty, it must be "Other"
  React.useEffect(() => {
    if (value && allowOther) {
      const exists = options.some(opt => opt.value === value)
      if (!exists && value !== "other") {
        setIsOther(true)
        setOtherValue(value)
      }
    }
  }, [value, options, allowOther])

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "other") {
      setIsOther(true)
      setOtherValue("")
      onChange("")
    } else {
      setIsOther(false)
      onChange(selectedValue)
    }
    setOpen(false)
    setSearchQuery("")
  }

  const selectedOption = options.find((opt) => opt.value === value)
  
  const displayValue = isOther 
    ? "Other" 
    : selectedOption 
      ? selectedOption.label 
      : ""

  return (
    <div className={cn("flex flex-col gap-2", className)} ref={containerRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !displayValue && "text-muted-foreground"
          )}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {open && (
          <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            <div className="sticky top-0 z-10 flex items-center border-b bg-popover px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="p-1">
              {filteredOptions.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No options found.
                </div>
              )}
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value === option.value && !isOther && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value && !isOther ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              ))}
              {allowOther && (
                <div
                  onClick={() => handleSelect("other")}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-t mt-1 pt-1.5",
                    isOther && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isOther ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Other (Please Specify)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isOther && (
        <div className="mt-1 animate-in fade-in slide-in-from-top-1">
          <Input
            placeholder={otherPlaceholder}
            value={otherValue}
            onChange={(e) => {
              setOtherValue(e.target.value)
              onChange(e.target.value)
            }}
            className="w-full"
            autoFocus
          />
        </div>
      )}
    </div>
  )
}
