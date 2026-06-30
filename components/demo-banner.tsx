'use client'

import { DEMO_MODE_ENABLED, DEMO_BANNER_TEXT } from '@/lib/config/demo-config'

export function DemoBanner() {
  if (!DEMO_MODE_ENABLED) {
    return null
  }

  return (
    <div className="w-full bg-yellow-100 border-b-2 border-yellow-400 px-4 py-2 text-center">
      <div className="text-sm font-semibold text-yellow-900">
        ⚠️ {DEMO_BANNER_TEXT}
      </div>
    </div>
  )
}
