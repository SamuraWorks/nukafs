/** ISO/IEC 7810 ID-1 (CR80) — bank card / national ID dimensions */
export const CR80 = {
  widthMm: 85.6,
  heightMm: 53.98,
  aspectRatio: 85.6 / 53.98,
  cornerRadiusMm: 3,
  borderMm: 0.35,
  safeMarginMm: 3,
  qrSizeMm: 23,
  /** Passport photo height as fraction of total card height */
  photoHeightRatio: 0.3,
  printDpi: 300,
} as const

export const CR80_PRINT_PX = {
  width: Math.round((CR80.widthMm / 25.4) * CR80.printDpi),
  height: Math.round((CR80.heightMm / 25.4) * CR80.printDpi),
} as const

/** Screen preview scale — card stays true CR80 proportions internally */
export const CR80_DISPLAY_SCALE = 1.55

/** White margin around card in preview frame */
export const CR80_FRAME_MARGIN_MM = 4

export function mmToPx(mm: number, dpi = CR80.printDpi): number {
  return Math.round((mm / 25.4) * dpi)
}
