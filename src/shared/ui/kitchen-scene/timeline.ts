export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
export const smooth = (value: number) => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

/** All values are derived from absolute scroll position, so reverse scrolling is exact. */
export function kitchenTimeline(input: number) {
  const progress = Number.isFinite(input) ? Math.min(9, Math.max(0, input)) : 0
  const removal = smooth(progress - 1)
  const reassembly = smooth(progress - 8)
  const separated = removal * (1 - reassembly)
  const cleaning = smooth(progress - 2)
  const sanding = smooth(progress - 3)
  const masking = smooth(progress - 4)
  const primer = smooth(progress - 5)
  const firstCoat = smooth((progress - 6) / 0.47)
  const secondCoat = smooth((progress - 6.48) / 0.48)

  return {
    progress,
    inspection: (1 - smooth(progress - 0.45)) * (1 - removal),
    separated,
    cleaning,
    sanding,
    masking: masking * (1 - reassembly),
    primer,
    firstCoat,
    secondCoat,
    patch: smooth((progress - 2.84) / 0.26) * (1 - smooth((progress - 5.15) / 0.7)),
    closeup: Math.max(
      smooth((progress - 2.72) / 0.43) * (1 - smooth((progress - 3.72) / 0.47)),
      0.48 * smooth((progress - 5.22) / 0.4) * (1 - smooth((progress - 7.04) / 0.48)),
    ),
    cure: smooth((progress - 7) / 0.4) * (1 - smooth((progress - 8) / 0.45)),
  }
}
