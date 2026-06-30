"use client"

import type { CSSProperties } from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import QRCode from "react-qr-code"
import { cn } from "@/lib/utils"
import { getVerifyUrl } from "@/lib/membership"
import { CARD_THEME } from "@/lib/membership-card-theme"

interface MembershipQrCodeProps {
  membershipNumber: string
  membershipId?: string
  qrCodeValue?: string
  size?: number
  className?: string
  style?: CSSProperties
  showLogo?: boolean
}

export function MembershipQrCode({
  membershipNumber,
  membershipId,
  qrCodeValue,
  size = 88,
  className,
  style,
  showLogo = true,
}: MembershipQrCodeProps) {
  const identityValue = qrCodeValue?.trim() || membershipId?.trim() || membershipNumber
  const [verifyUrl, setVerifyUrl] = useState(() => getVerifyUrl(identityValue))

  useEffect(() => {
    setVerifyUrl(getVerifyUrl(identityValue))
  }, [identityValue])

  return (
    <div
      className={cn("relative flex items-center justify-center bg-white", className)}
      style={style}
    >
      <QRCode
        value={verifyUrl}
        size={size}
        level="M"
        bgColor={CARD_THEME.white}
        fgColor={CARD_THEME.navy}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
      {showLogo && (
        <div
          className="pointer-events-none absolute flex items-center justify-center rounded-full bg-white"
          style={{
            width: "22%",
            height: "22%",
            boxShadow: "0 0 0 0.15mm rgba(11,31,58,0.08)",
          }}
        >
          <Image
            src="/nukafs-logo.png"
            alt=""
            width={24}
            height={24}
            className="h-[70%] w-[70%] object-contain"
            aria-hidden
          />
        </div>
      )}
    </div>
  )
}
