'use client'

import Image from 'next/image'
import { generateQRCodeUrl } from '@/lib/membership-identity'

interface MembershipCardProps {
  membershipId: string
  fullName: string
  role: string
  university?: string
  email: string
  dateIssued: string
  qrData: string
  photoUrl?: string
}

export function DigitalMembershipCard({
  membershipId,
  fullName,
  role,
  university,
  email,
  dateIssued,
  qrData,
  photoUrl,
}: MembershipCardProps) {
  const qrCodeUrl = generateQRCodeUrl(qrData, 150)
  const roleLabel = {
    student: 'Student Member',
    executive: 'Executive Member',
    admin: 'Administrator',
    stakeholder: 'Stakeholder Partner',
    super_admin: 'Super Administrator',
  }[role] || role

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-xl overflow-hidden text-white">
        {/* Card Header */}
        <div className="bg-blue-900 px-6 py-4 border-b-2 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-blue-100">NUKAFS</h2>
              <p className="text-xs text-blue-200">Membership Card</p>
            </div>
            <div className="text-yellow-400 font-bold text-2xl">✓</div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Profile Section */}
          <div className="flex gap-4 items-start">
            {photoUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-blue-400 flex-shrink-0">
                <Image
                  src={photoUrl}
                  alt={fullName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{fullName}</h3>
              <p className="text-sm text-blue-100">{roleLabel}</p>
              {university && <p className="text-xs text-blue-200 truncate">{university}</p>}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm border-t border-blue-400 pt-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Membership ID:</span>
              <span className="font-mono font-bold text-yellow-300">{membershipId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Email:</span>
              <span className="text-xs truncate text-blue-100">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Issued:</span>
              <span className="text-blue-100">{new Date(dateIssued).toLocaleDateString()}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center pt-3">
            <img
              src={qrCodeUrl}
              alt="Membership QR Code"
              className="w-32 h-32 border-2 border-blue-200 p-1 bg-white rounded"
            />
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-blue-900 px-6 py-3 text-center border-t border-blue-400">
          <p className="text-xs text-blue-200">Scan QR to verify membership</p>
        </div>
      </div>
    </div>
  )
}
