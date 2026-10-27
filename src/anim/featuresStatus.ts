// Whether the lazy motion feature bundle has loaded. Until it has, `m` components render static,
// so an `initial` style that only `animate` can undo (opacity 0) would strand them invisible.
let loaded = false
const listeners = new Set<() => void>()

export function markFeaturesLoaded(): void {
  if (loaded) return
  loaded = true
  for (const listener of [...listeners]) listener()
}

export function subscribeFeatures(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

export const featuresLoaded = (): boolean => loaded
