import Image from "next/image"
import { cn } from "@/lib/utils"

export function NUKaFsLogo({
  className,
  showText = true,
  textClassName,
}: {
  className?: string
  showText?: boolean
  textClassName?: string
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-border">
        <Image
          src="/nukafs-logo.png"
          alt="NUKaFs Logo"
          width={36}
          height={36}
          className="h-full w-full object-contain p-0.5"
          priority
        />
      </div>
      {showText && (
        <div className={cn("flex flex-col leading-none", textClassName)}>
          <span className="font-heading text-base font-bold tracking-tight">NUKaFs</span>
          <span className="text-[10px] font-medium text-muted-foreground">Registry</span>
        </div>
      )}
    </div>
  )
}
