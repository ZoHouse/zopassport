// src/lib/utils/styles.ts
// Utility for managing injected CSS with proper cleanup

// Track how many components are using each style
const styleRefCounts = new Map<string, number>();

/**
 * Inject styles into the document head with reference counting
 * Multiple components can share the same styles safely
 * 
 * @param styleId - Unique identifier for the style block
 * @param css - CSS content to inject
 * @returns Cleanup function to call on unmount
 */
export function injectStyles(styleId: string, css: string): () => void {
  if (typeof document === 'undefined') {
    // SSR - return no-op cleanup
    return () => {};
  }

  const currentCount = styleRefCounts.get(styleId) || 0;

  if (currentCount === 0) {
    // First component using this style - inject it
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Increment reference count
  styleRefCounts.set(styleId, currentCount + 1);

  // Return cleanup function
  return () => {
    const count = styleRefCounts.get(styleId) || 0;
    if (count <= 1) {
      // Last component using this style - remove it
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
      styleRefCounts.delete(styleId);
    } else {
      // Other components still using this style
      styleRefCounts.set(styleId, count - 1);
    }
  };
}

/**
 * Check if styles are already injected
 * @param styleId - Unique identifier for the style block
 */
export function hasStyles(styleId: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.getElementById(styleId) !== null;
}

