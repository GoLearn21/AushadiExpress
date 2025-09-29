// Global design tokens following 8-pt baseline grid
export const colors = {
  'primary-500': '#4D94FF',
  'primary-400': '#267DFF',
  'tint-200': '#D1E4FF',
  'tint-100': '#E6F0FF',
  'green': '#28A745',
};

export const ramp = { xl: 24, lg: 20, md: 16, sm: 14, xs: 12 };

export const theme = {
  // Spacing using 8-point baseline grid
  spacing: {
    xs: '4px',      // 0.5 * BASE
    sm: '8px',      // 1 * BASE  
    md: '16px',     // 2 * BASE
    lg: '24px',     // 3 * BASE
    xl: '32px',     // 4 * BASE
    '2xl': '48px',  // 6 * BASE
    '3xl': '64px',  // 8 * BASE
  },

  // Typography scale with line heights
  typography: {
    'heading-xl': {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '700'
    },
    'heading-lg': {
      fontSize: '20px', 
      lineHeight: '28px',
      fontWeight: '600'
    },
    'heading-md': {
      fontSize: '18px',
      lineHeight: '24px', 
      fontWeight: '600'
    },
    'body-lg': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400'
    },
    'body': {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400'
    },
    'body-sm': {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400'
    }
  },

  // Icon sizes following 8-pt grid
  iconSizes: {
    xs: '16px',
    sm: '20px', 
    md: '24px',
    lg: '32px',
    xl: '48px'
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  }
};

// Tailwind helper classes for consistent styling
export const tw = {
  // Typography helpers
  headingXl: 'text-2xl leading-8 font-bold',
  headingLg: 'text-xl leading-7 font-semibold', 
  headingMd: 'text-lg leading-6 font-semibold',
  bodyLg: 'text-base leading-6',
  body: 'text-sm leading-5',
  bodySm: 'text-xs leading-4',

  // Spacing helpers  
  paddingXs: 'p-1',      // 4px
  paddingSm: 'p-2',      // 8px
  paddingMd: 'p-4',      // 16px
  paddingLg: 'p-6',      // 24px
  paddingXl: 'p-8',      // 32px

  marginXs: 'm-1',       // 4px
  marginSm: 'm-2',       // 8px
  marginMd: 'm-4',       // 16px
  marginLg: 'm-6',       // 24px
  marginXl: 'm-8',       // 32px

  // Icon size helpers
  iconXs: 'w-4 h-4',     // 16px
  iconSm: 'w-5 h-5',     // 20px  
  iconMd: 'w-6 h-6',     // 24px
  iconLg: 'w-8 h-8',     // 32px
  iconXl: 'w-12 h-12',   // 48px

  // Card styling
  card: 'rounded-lg shadow-sm border border-border',
  cardHover: 'hover:shadow-md transition-shadow duration-200',
  
  // Button styling
  buttonPrimary: 'bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium',
  buttonSecondary: 'bg-secondary text-secondary-foreground rounded-lg px-4 py-2 font-medium',
  
  // Status indicators
  statusOnline: 'w-2 h-2 bg-green-500 rounded-full',
  statusOffline: 'w-2 h-2 bg-gray-400 rounded-full',
  statusSyncing: 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse'
};

// Animation variants for fade in effects
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Color helper functions
export const getTint = (lvl: 100 | 200): string => {
  return colors[`tint-${lvl}`];
};

export const getPrimary = (level: 400 | 500): string => {
  return colors[`primary-${level}`];
};

export const getColor = (color: keyof typeof colors): string => {
  return colors[color];
};