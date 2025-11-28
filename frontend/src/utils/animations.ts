// Animation utilities for consistent micro-interactions

export const animations = {
  // Fade animations
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  fadeOut: {
    '@keyframes fadeOut': {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    animation: 'fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Slide animations
  slideInUp: {
    '@keyframes slideInUp': {
      from: {
        transform: 'translateY(20px)',
        opacity: 0,
      },
      to: {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
    animation: 'slideInUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideInDown: {
    '@keyframes slideInDown': {
      from: {
        transform: 'translateY(-20px)',
        opacity: 0,
      },
      to: {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
    animation: 'slideInDown 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideInLeft: {
    '@keyframes slideInLeft': {
      from: {
        transform: 'translateX(-20px)',
        opacity: 0,
      },
      to: {
        transform: 'translateX(0)',
        opacity: 1,
      },
    },
    animation: 'slideInLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideInRight: {
    '@keyframes slideInRight': {
      from: {
        transform: 'translateX(20px)',
        opacity: 0,
      },
      to: {
        transform: 'translateX(0)',
        opacity: 1,
      },
    },
    animation: 'slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Scale animations
  scaleIn: {
    '@keyframes scaleIn': {
      from: {
        transform: 'scale(0.95)',
        opacity: 0,
      },
      to: {
        transform: 'scale(1)',
        opacity: 1,
      },
    },
    animation: 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Bounce animation
  bounce: {
    '@keyframes bounce': {
      '0%, 100%': {
        transform: 'translateY(0)',
      },
      '50%': {
        transform: 'translateY(-8px)',
      },
    },
    animation: 'bounce 1.4s ease-in-out infinite',
  },

  // Pulse animation
  pulse: {
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.5,
      },
    },
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },

  // Shake animation (for errors)
  shake: {
    '@keyframes shake': {
      '0%, 100%': {
        transform: 'translateX(0)',
      },
      '10%, 30%, 50%, 70%, 90%': {
        transform: 'translateX(-4px)',
      },
      '20%, 40%, 60%, 80%': {
        transform: 'translateX(4px)',
      },
    },
    animation: 'shake 400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Spin animation
  spin: {
    '@keyframes spin': {
      from: {
        transform: 'rotate(0deg)',
      },
      to: {
        transform: 'rotate(360deg)',
      },
    },
    animation: 'spin 1s linear infinite',
  },
};

// Transition presets
export const transitions = {
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  verySlow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Hover effects
export const hoverEffects = {
  lift: {
    transition: transitions.normal,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  },

  scale: {
    transition: transitions.normal,
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },

  glow: {
    transition: transitions.normal,
    '&:hover': {
      boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)',
    },
  },

  brighten: {
    transition: transitions.normal,
    '&:hover': {
      filter: 'brightness(1.1)',
    },
  },
};

// Focus effects for accessibility
export const focusEffects = {
  outline: {
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  },

  ring: {
    '&:focus-visible': {
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.3)',
    },
  },
};
