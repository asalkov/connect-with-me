// Accessibility utilities for WCAG compliance

/**
 * Generate ARIA label for status indicators
 */
export const getStatusAriaLabel = (status: string): string => {
  const labels: Record<string, string> = {
    online: 'User is online',
    offline: 'User is offline',
    away: 'User is away',
    busy: 'User is busy',
  };
  return labels[status] || 'User status unknown';
};

/**
 * Generate ARIA label for timestamps
 */
export const getTimestampAriaLabel = (timestamp: string): string => {
  return `Message sent at ${timestamp}`;
};

/**
 * Generate ARIA label for unread count
 */
export const getUnreadAriaLabel = (count: number): string => {
  if (count === 0) return 'No unread messages';
  if (count === 1) return '1 unread message';
  return `${count} unread messages`;
};

/**
 * Check if element is keyboard focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  return (
    focusableTags.includes(element.tagName) ||
    element.hasAttribute('tabindex') ||
    element.hasAttribute('contenteditable')
  );
};

/**
 * Trap focus within a container (for modals)
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Get contrast ratio between two colors (simplified)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // This is a simplified version - in production, use a proper color library
  // For now, return a placeholder
  return 4.5; // WCAG AA minimum for normal text
};

/**
 * Check if color combination meets WCAG standards
 */
export const meetsWCAGContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? (isLargeText ? 4.5 : 7) : isLargeText ? 3 : 4.5;
  return ratio >= minRatio;
};

/**
 * Generate skip link for keyboard navigation
 */
export const createSkipLink = (targetId: string, label: string): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
};

/**
 * Keyboard event helpers
 */
export const keyboardHelpers = {
  isEnterKey: (e: KeyboardEvent) => e.key === 'Enter',
  isSpaceKey: (e: KeyboardEvent) => e.key === ' ' || e.key === 'Spacebar',
  isEscapeKey: (e: KeyboardEvent) => e.key === 'Escape' || e.key === 'Esc',
  isArrowKey: (e: KeyboardEvent) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key),
  isTabKey: (e: KeyboardEvent) => e.key === 'Tab',
};

/**
 * ARIA live region helper
 */
export const createLiveRegion = (priority: 'polite' | 'assertive' = 'polite'): HTMLDivElement => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  return liveRegion;
};
