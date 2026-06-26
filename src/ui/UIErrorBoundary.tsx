/**
 * Reusable UI error boundary (M6 fix).
 *
 * Contains render-time errors thrown by a component subtree — such as an
 * out-of-range sprite index that throws `RangeError` from `frameRect` /
 * `spriteBackground` during render — so one failing component degrades to a
 * local fallback instead of unmounting the whole app. Wraps the dev gallery now
 * and is exported for future region overlays. The fail-fast throwing contract of
 * `frameRect` / `spriteBackground` is unchanged; this only catches at the UI
 * boundary.
 */

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

export interface UIErrorBoundaryProps {
  /** Rendered in place of the subtree when it throws during render. */
  fallback?: ReactNode
  children: ReactNode
}

interface UIErrorBoundaryState {
  hasError: boolean
}

export class UIErrorBoundary extends Component<UIErrorBoundaryProps, UIErrorBoundaryState> {
  state: UIErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): UIErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the contained error for debugging without re-throwing.
    console.error('UIErrorBoundary caught a render error', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
