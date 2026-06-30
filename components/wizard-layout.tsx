"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
}

interface WizardLayoutProps {
  steps: Step[]
  currentStepIndex: number
  children: React.ReactNode
  className?: string
}

export function WizardLayout({
  steps,
  currentStepIndex,
  children,
  className
}: WizardLayoutProps) {
  const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100)

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4 mb-4">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Profile Setup Progress</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps Tracker */}
        <div className="hidden md:flex items-center justify-between pt-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                      isCurrent ? "border-primary text-primary" : "border-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : index + 1}
                  </div>
                  <span 
                    className={cn(
                      "text-xs font-medium max-w-[80px] text-center",
                      isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-[2px] flex-1 mx-2 transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="relative">
        {children}
      </div>
    </div>
  )
}
