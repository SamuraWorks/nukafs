"use client"

import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import {
  Building2,
  CalendarDays,
  GraduationCap,
  IdCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatMembershipDate,
  NUKaFs_CONTACT,
  type VerifiedMemberProfile,
} from "@/lib/membership"
import { CARD_THEME } from "@/lib/membership-card-theme"
import {
  CR80,
  CR80_DISPLAY_SCALE,
  CR80_FRAME_MARGIN_MM,
  mmToPx,
} from "@/lib/membership-card-spec"
import { MembershipQrCode } from "@/components/membership/membership-qr-code"

interface DigitalMembershipCardProps {
  member: VerifiedMemberProfile
  isFlipped?: boolean
  onFlip?: () => void
  className?: string
  displayScale?: number
}

const PHOTO_W_MM = 15.2
const PHOTO_H_MM = 16.2
const QR_MM = 18.5
const FOOTER_H_MM = 11.5
const HEADER_H_MM = 17.5

function CardBackgroundTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: "#F3F4F6",
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(11,31,58,0.03) 0%, transparent 55%),
          linear-gradient(0deg, rgba(11,31,58,0.025) 0.35px, transparent 0.35px),
          linear-gradient(90deg, rgba(11,31,58,0.025) 0.35px, transparent 0.35px)
        `,
        backgroundSize: "100% 100%, 1.1mm 1.1mm, 1.1mm 1.1mm",
      }}
    />
  )
}

function CenterWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Image
        src="/nukafs-logo.png"
        alt=""
        width={mmToPx(34)}
        height={mmToPx(34)}
        className="opacity-[0.045]"
        aria-hidden
      />
    </div>
  )
}

function HologramSeal() {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: "11mm",
        height: "11mm",
        boxShadow: "0 0 0 0.25mm rgba(212,175,55,0.55)",
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[conic-gradient(from_45deg,#e8c547,#7b68ee,#4fc3f7,#d4af37,#e8c547)] opacity-80" />
      <div className="absolute inset-[0.8mm] flex flex-col items-center justify-center rounded-full bg-white/15 backdrop-blur-[1px]">
        <Image
          src="/nukafs-logo.png"
          alt=""
          width={20}
          height={20}
          className="h-[4.5mm] w-[4.5mm] object-contain opacity-90"
        />
        <span
          className="mt-[0.2mm] font-bold uppercase"
          style={{ fontSize: "1.1mm", color: CARD_THEME.navy }}
        >
          NUKaFs-SL
        </span>
      </div>
    </div>
  )
}

function MemberPhoto({ member }: { member: VerifiedMemberProfile }) {
  const initials = member.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  return (
    <div
      className="relative shrink-0 overflow-hidden bg-white"
      style={{
        width: `${PHOTO_W_MM}mm`,
        height: `${PHOTO_H_MM}mm`,
        border: `0.35mm solid ${CARD_THEME.gold}`,
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center font-semibold text-white relative overflow-hidden"
        style={{
          backgroundColor: member.avatarColor,
          fontSize: "4.2mm",
        }}
      >
        {member.profilePhotoUrl ? (
          <Image
            src={member.profilePhotoUrl}
            alt={member.fullName}
            fill
            className="object-cover"
          />
        ) : (
          initials
        )}
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  gold = false,
}: {
  icon: typeof User
  label: string
  value: string
  gold?: boolean
}) {
  return (
    <div className="flex items-center gap-[1.2mm]">
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: "3.4mm",
          height: "3.4mm",
          background: CARD_THEME.navy,
          borderRadius: "0.4mm",
        }}
      >
        <Icon style={{ width: "1.9mm", height: "1.9mm", color: "#fff" }} strokeWidth={2.5} />
      </div>
      <div className="flex min-w-0 flex-1 items-center">
        <span
          className="shrink-0 font-bold uppercase"
          style={{
            width: "18.5mm",
            fontSize: "1.35mm",
            color: CARD_THEME.navy,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </span>
        <span
          className="mx-[0.8mm] shrink-0 text-gray-400"
          style={{ fontSize: "1.35mm" }}
        >
          |
        </span>
        <span
          className={cn("min-w-0 font-bold leading-[1.15]", gold && "font-mono")}
          style={{
            fontSize: gold ? "1.75mm" : "1.45mm",
            color: gold ? CARD_THEME.goldMuted : CARD_THEME.navy,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function WaveFooterBackground() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 w-full"
      viewBox="0 0 856 115"
      preserveAspectRatio="none"
      style={{ height: `${FOOTER_H_MM}mm` }}
      aria-hidden
    >
      <path
        d="M0,38 C120,8 200,42 320,18 C440,0 520,34 640,12 C740,0 820,22 856,28 L856,115 L0,115 Z"
        fill={CARD_THEME.navy}
      />
      <path
        d="M0,34 C120,4 200,38 320,14 C440,-4 520,30 640,8 C740,-4 820,18 856,24"
        fill="none"
        stroke={CARD_THEME.gold}
        strokeWidth="2.5"
      />
    </svg>
  )
}

function TopLeftAccent() {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0"
      style={{
        width: "0",
        height: "0",
        borderTop: "3mm solid transparent",
        borderBottom: "3mm solid transparent",
        borderLeft: `3mm solid ${CARD_THEME.gold}`,
      }}
    />
  )
}

function LogoBadgeBackdrop() {
  return (
    <div
      className="pointer-events-none absolute rounded-full"
      style={{
        width: "16.5mm",
        height: "16.5mm",
        left: "2.2mm",
        top: "1.6mm",
        background: CARD_THEME.navy,
        boxShadow: `0 0 0 0.25mm ${CARD_THEME.gold}`,
      }}
      aria-hidden
    />
  )
}

function Cr80CardShell({
  children,
  variant,
  className,
  style,
}: {
  children: ReactNode
  variant: "front" | "back"
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={cn(
        "cr80-card-face absolute inset-0 flex flex-col overflow-hidden backface-hidden",
        className,
      )}
      style={{
        width: `${CR80.widthMm}mm`,
        height: `${CR80.heightMm}mm`,
        borderRadius: `${CR80.cornerRadiusMm}mm`,
        background: variant === "front" ? "#F3F4F6" : CARD_THEME.navy,
        color: variant === "front" ? CARD_THEME.ink : CARD_THEME.white,
        border: `${CR80.borderMm}mm solid rgba(212, 175, 55, 0.55)`,
        boxShadow: "0 0.6mm 1.8mm rgba(11, 31, 58, 0.16)",
        ...(variant === "back" ? { transform: "rotateY(180deg)" } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function CardFront({ member }: { member: VerifiedMemberProfile }) {
  return (
    <Cr80CardShell variant="front" className="font-sans">
      <CardBackgroundTexture />
      <CenterWatermark />
      <TopLeftAccent />
      <LogoBadgeBackdrop />
      <WaveFooterBackground />

      {/* Header */}
      <div
        className="relative z-20 flex w-full shrink-0 items-start justify-between"
        style={{ height: `${HEADER_H_MM}mm`, padding: "1.8mm 3mm 0" }}
      >
        <div
          className="relative z-30 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
          style={{
            width: "14.5mm",
            height: "14.5mm",
            marginTop: "0.5mm",
            marginLeft: "0.2mm",
            border: `0.35mm solid ${CARD_THEME.gold}`,
            boxShadow: "0 0.3mm 0.8mm rgba(11,31,58,0.12)",
          }}
        >
          <Image
            src="/nukafs-logo.png"
            alt="NUKaFs-SL"
            width={mmToPx(13)}
            height={mmToPx(13)}
            className="h-[88%] w-[88%] object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col items-center px-[2mm] pt-[0.8mm] text-center">
          <p
            className="font-bold leading-[1.12]"
            style={{ fontSize: "2mm", color: CARD_THEME.navy }}
          >
            NATIONAL UNION OF
            <br />
            KOINADUGU AND FALABA STUDENTS
            <br />
            (NUKaFs-SL)
          </p>
          <div className="mt-[0.8mm] flex w-full items-center justify-center gap-[1mm]">
            <div className="h-[0.18mm] w-[7mm]" style={{ background: CARD_THEME.gold }} />
            <span
              className="font-bold uppercase"
              style={{
                fontSize: "1.15mm",
                color: CARD_THEME.goldMuted,
                letterSpacing: "0.06em",
              }}
            >
              Official Digital Membership Card
            </span>
            <div className="h-[0.18mm] w-[7mm]" style={{ background: CARD_THEME.gold }} />
          </div>
        </div>

        <div className="shrink-0 pt-[0.3mm]">
          <HologramSeal />
        </div>
      </div>

      {/* Body */}
      <div
        className="relative z-10 flex min-h-0 flex-1 items-center"
        style={{
          padding: `0.5mm ${CR80.safeMarginMm}mm ${FOOTER_H_MM + 0.5}mm`,
          gap: "2mm",
        }}
      >
        <MemberPhoto member={member} />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[1.5mm]">
          <InfoRow
            icon={User}
            label="Full Name"
            value={member.fullName.toUpperCase()}
          />
          <InfoRow
            icon={IdCard}
            label="Membership ID"
            value={member.membershipNumber}
            gold
          />
          <InfoRow
            icon={GraduationCap}
            label="Membership Type"
            value={member.membershipType.toUpperCase()}
          />
          <InfoRow
            icon={Building2}
            label="University"
            value={member.university.toUpperCase()}
          />
          <InfoRow
            icon={CalendarDays}
            label="Date Issued"
            value={formatMembershipDate(member.dateApproved).toUpperCase()}
          />
        </div>

        <div className="flex shrink-0 flex-col items-center">
          <div
            className="bg-white"
            style={{
              padding: "0.8mm",
              border: `0.35mm solid ${CARD_THEME.gold}`,
            }}
          >
            <MembershipQrCode
              membershipNumber={member.membershipNumber}
              membershipId={member.membershipId}
              qrCodeValue={member.qrCodeValue}
              size={mmToPx(QR_MM)}
              style={{ width: `${QR_MM}mm`, height: `${QR_MM}mm` }}
            />
          </div>
          <div
            className="mt-[1mm] flex w-full items-center justify-center gap-[0.6mm] rounded-[0.6mm] px-[1.2mm] py-[0.7mm]"
            style={{ background: CARD_THEME.navy }}
          >
            <Smartphone
              style={{ width: "1.5mm", height: "1.5mm", color: "#fff" }}
              strokeWidth={2.5}
            />
            <span
              className="text-center font-bold uppercase leading-none text-white"
              style={{ fontSize: "1.05mm", letterSpacing: "0.02em" }}
            >
              Scan to Verify Membership
            </span>
          </div>
        </div>
      </div>

      {/* Footer overlay */}
      <div
        className="absolute bottom-0 left-0 z-20 flex w-full items-end justify-between"
        style={{
          height: `${FOOTER_H_MM}mm`,
          padding: "0 3.5mm 1.4mm",
        }}
      >
        <div className="flex max-w-[22mm] items-center gap-[1mm]">
          <ShieldCheck
            style={{ width: "4mm", height: "4mm", color: CARD_THEME.gold }}
            strokeWidth={2}
          />
          <div>
            <p
              className="font-bold uppercase leading-none"
              style={{ fontSize: "1.1mm", color: CARD_THEME.gold }}
            >
              Card Serial No.
            </p>
            <p
              className="mt-[0.4mm] font-mono font-bold leading-none text-white"
              style={{ fontSize: "1.45mm" }}
            >
              {member.cardSerialNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center pb-[0.2mm]">
          <p
            className="italic leading-none"
            style={{
              fontSize: "2.8mm",
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: CARD_THEME.goldBright,
            }}
          >
            A. Bangura
          </p>
          <div
            className="mt-[0.4mm]"
            style={{
              width: "18mm",
              height: "0.2mm",
              background: CARD_THEME.gold,
            }}
          />
          <p
            className="mt-[0.4mm] font-bold uppercase leading-none"
            style={{ fontSize: "1.05mm", color: CARD_THEME.gold, letterSpacing: "0.04em" }}
          >
            National President
          </p>
        </div>

        <div className="flex max-w-[28mm] items-start gap-[1mm]">
          <Lock
            style={{
              width: "3.5mm",
              height: "3.5mm",
              color: CARD_THEME.gold,
              marginTop: "0.2mm",
            }}
            strokeWidth={2}
          />
          <p
            className="leading-[1.25] text-white/90"
            style={{ fontSize: "0.95mm" }}
          >
            THIS CARD IS THE PROPERTY OF National Union of Koinadugu and
            Falaba Students (NUKaFs-SL). If found, please return to the
            NUKaFs-SL Secretariat.
          </p>
        </div>
      </div>
    </Cr80CardShell>
  )
}

function CardBack({ member }: { member: VerifiedMemberProfile }) {
  return (
    <Cr80CardShell variant="back">
      <div
        className="shrink-0"
        style={{
          height: "0.65mm",
          background: `linear-gradient(90deg, ${CARD_THEME.gold}, ${CARD_THEME.goldBright}, ${CARD_THEME.gold})`,
        }}
      />

      <CenterWatermark />

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col"
        style={{ padding: `2.2mm ${CR80.safeMarginMm}mm 1.6mm` }}
      >
        <div className="space-y-[1.5mm]">
          <div className="flex items-start gap-[1mm]">
            <ShieldCheck
              className="mt-[0.15mm] shrink-0"
              style={{ width: "2.6mm", height: "2.6mm", color: CARD_THEME.gold }}
            />
            <p className="leading-snug text-white/90" style={{ fontSize: "1.65mm" }}>
              This card is the official property of NUKaFs-SL. Unauthorized
              reproduction or misuse is prohibited.
            </p>
          </div>

          <div
            className="rounded-[0.7mm] px-[1.8mm] py-[1.3mm]"
            style={{
              border: `0.2mm solid ${CARD_THEME.gold}44`,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <p
              className="font-semibold uppercase"
              style={{
                fontSize: "1.45mm",
                letterSpacing: "0.09em",
                color: CARD_THEME.goldBright,
              }}
            >
              QR Verification
            </p>
            <p
              className="mt-[0.5mm] leading-snug text-white/75"
              style={{ fontSize: "1.55mm" }}
            >
              Scan the QR code on the front to verify authenticity via the
              official NUKaFs-SL registry.
            </p>
          </div>

          <div>
            <p
              className="mb-[0.6mm] font-semibold uppercase"
              style={{
                fontSize: "1.45mm",
                letterSpacing: "0.09em",
                color: CARD_THEME.goldBright,
              }}
            >
              Official Contact
            </p>
            <div className="space-y-[0.55mm] text-white/78">
              <p style={{ fontSize: "1.6mm" }}>{NUKaFs_CONTACT.website}</p>
              <p style={{ fontSize: "1.6mm" }}>{NUKaFs_CONTACT.email}</p>
              <p style={{ fontSize: "1.6mm" }}>{NUKaFs_CONTACT.phone}</p>
            </div>
          </div>
        </div>

        <p
          className="mt-auto font-mono text-white/30"
          style={{ fontSize: "1.35mm" }}
        >
          {member.membershipNumber}
        </p>
      </div>

      <div
        className="shrink-0 text-center"
        style={{ padding: "1.2mm 2mm", background: CARD_THEME.gold }}
      >
        <p
          className="font-semibold uppercase"
          style={{
            fontSize: "1.45mm",
            letterSpacing: "0.1em",
            color: CARD_THEME.navy,
          }}
        >
          Empowering Students, Building the Future.
        </p>
      </div>
    </Cr80CardShell>
  )
}

export function DigitalMembershipCard({
  member,
  isFlipped = false,
  onFlip,
  className,
  displayScale = CR80_DISPLAY_SCALE,
}: DigitalMembershipCardProps) {
  const frameW = (CR80.widthMm + CR80_FRAME_MARGIN_MM * 2) * displayScale
  const frameH = (CR80.heightMm + CR80_FRAME_MARGIN_MM * 2) * displayScale

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="membership-card-viewport relative flex items-center justify-center rounded-xl bg-white shadow-lg"
        style={{
          width: `${frameW}mm`,
          height: `${frameH}mm`,
          padding: `${CR80_FRAME_MARGIN_MM * displayScale}mm`,
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onFlip}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onFlip?.()
            }
          }}
          className="membership-card-scene relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-4"
          style={{
            width: `${CR80.widthMm}mm`,
            height: `${CR80.heightMm}mm`,
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          aria-label="Digital membership card. Click to flip."
        >
          <CardFront member={member} />
          <CardBack member={member} />
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5" style={{ color: CARD_THEME.gold }} />
        CR80 · 85.60 × 53.98 mm · click to flip
      </p>
    </div>
  )
}
