'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { verifyMembershipQRData } from '@/lib/membership-identity'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface VerifiedMember {
  membershipId: string
  fullName: string
  email: string
  role: string
  university?: string
  dateIssued: string
}

export default function VerifyMembershipPage() {
  const [qrData, setQrData] = useState<string | null>(null)
  const [membershipId, setMembershipId] = useState<string | null>(null)
  const [queryLoaded, setQueryLoaded] = useState(false)

  const [verifiedMember, setVerifiedMember] = useState<VerifiedMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQrData(params.get('data'))
    setMembershipId(params.get('id'))
    setQueryLoaded(true)
  }, [])

  useEffect(() => {
    if (!queryLoaded) {
      return
    }

    const verify = async () => {
      try {
        if (qrData) {
          const verification = verifyMembershipQRData(qrData)
          if (!verification.valid) {
            setError(verification.error || 'Invalid QR code')
            setIsLoading(false)
            return
          }
        }

        if (membershipId) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          )

          const { data, error: queryError } = await supabase
            .from('users')
            .select('id, full_name, email, role, membership_number, date_issued, university')
            .eq('membership_number', membershipId)
            .maybeSingle()

          if (queryError) {
            setError('Membership not found')
            setIsLoading(false)
            return
          }

          if (data) {
            setVerifiedMember({
              membershipId: data.membership_number,
              fullName: data.full_name,
              email: data.email,
              role: data.role,
              university: data.university,
              dateIssued: data.date_issued,
            })
          }
        }

        setIsLoading(false)
      } catch (err: any) {
        setError(err.message || 'Verification failed')
        setIsLoading(false)
      }
    }

    verify()
  }, [qrData, membershipId, queryLoaded])

  const roleLabel = {
    student: 'Student Member',
    executive: 'Executive Member',
    admin: 'Administrator',
    stakeholder: 'Stakeholder Partner',
    super_admin: 'Super Administrator',
  }[verifiedMember?.role || ''] || verifiedMember?.role

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {isLoading ? (
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="shadow-xl border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : verifiedMember ? (
          <Card className="shadow-xl border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="size-12 text-green-600" />
                  <h2 className="font-heading text-2xl font-bold text-green-900 dark:text-green-100">
                    Membership Verified
                  </h2>
                </div>

                <div className="w-full space-y-4 border-t border-green-200 dark:border-green-800 pt-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Member Name</p>
                    <p className="font-bold text-lg">{verifiedMember.fullName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Membership ID</p>
                    <p className="font-mono font-bold text-primary text-lg">{verifiedMember.membershipId}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Status</p>
                    <p className="font-semibold text-green-700 dark:text-green-300">{roleLabel}</p>
                  </div>

                  {verifiedMember.university && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Institution</p>
                      <p className="text-sm">{verifiedMember.university}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Date Issued</p>
                    <p className="text-sm">
                      {new Date(verifiedMember.dateIssued).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-xs text-green-900 dark:text-green-100">
                  <p className="font-semibold">✓ This is a verified NUKaFs member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <AlertCircle className="size-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-2">No Data Provided</h2>
              <p className="text-sm text-muted-foreground">Please scan a valid NUKaFs membership QR code</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
