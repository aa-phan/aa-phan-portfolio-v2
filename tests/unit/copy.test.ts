import { afterEach, describe, expect, it, vi } from 'vitest'
import { COPY_FALLBACK, COPY_SUCCESS, copyText } from '@/lib/copy'

const ADDRESS = 'aaron.phan240@gmail.com'

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value })
}

function setExecCommand(value: unknown) {
  Object.defineProperty(document, 'execCommand', { configurable: true, writable: true, value })
}

afterEach(() => {
  setClipboard(undefined)
  setExecCommand(undefined)
  vi.restoreAllMocks()
})

describe('copyText', () => {
  it('resolves true and writes the address when the Clipboard API works', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const readText = vi.fn()
    setClipboard({ writeText, readText })
    expect(await copyText(ADDRESS)).toBe(true)
    expect(writeText).toHaveBeenCalledWith(ADDRESS)
    expect(readText).not.toHaveBeenCalled()
  })

  it('falls back to execCommand when writeText rejects and leaves no textarea behind', async () => {
    const readText = vi.fn()
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')), readText })
    const exec = vi.fn().mockReturnValue(true)
    setExecCommand(exec)
    expect(await copyText(ADDRESS)).toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
    expect(readText).not.toHaveBeenCalled()
  })

  it('returns the execCommand result when it reports failure', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    setExecCommand(vi.fn().mockReturnValue(false))
    expect(await copyText(ADDRESS)).toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('resolves false when the Clipboard API and execCommand are both missing', async () => {
    setClipboard(undefined)
    setExecCommand(undefined)
    expect(await copyText(ADDRESS)).toBe(false)
  })

  it('resolves false and cleans up when execCommand throws', async () => {
    setClipboard(undefined)
    setExecCommand(
      vi.fn(() => {
        throw new Error('blocked')
      }),
    )
    expect(await copyText(ADDRESS)).toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })
})

describe('copy messages', () => {
  it('uses the contracted wording with a typographic apostrophe', () => {
    expect(COPY_SUCCESS).toBe('Email copied to clipboard')
    expect(COPY_FALLBACK).toBe('Couldn’t copy the address. Opening your mail app instead.')
  })
})
