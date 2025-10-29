export const colors = {
  // Primary brand colors - Midnight Blue
  primary: '#0A0F2C',
  primaryLight: '#1A2342',
  primaryDark: '#050815',
  
  // Accent color - Warm Gold
  accent: '#FFD100',
  accentLight: '#FFE55A',
  accentDark: '#E6BF00',
  
  // Support color - Soft Light Gray
  support: '#E5E5E5',
  supportLight: '#F5F5F5',
  supportDark: '#D5D5D5',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: '#6b7280',
  lightGray: '#E5E5E5',
  darkGray: '#374151',
  
  // Background colors
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  text: '#0A0F2C',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  textInverse: '#ffffff',
  
  // Status colors
  success: '#22c55e',
  successLight: '#86efac',
  successDark: '#15803d',
  
  warning: '#f59e0b',
  warningLight: '#fcd34d',
  warningDark: '#d97706',
  
  error: '#ef4444',
  errorLight: '#fca5a5',
  errorDark: '#dc2626',
  
  info: '#3b82f6',
  infoLight: '#93c5fd',
  infoDark: '#2563eb',
  
  // Border colors
  border: '#E5E5E5',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Category colors (for visual distinction)
  categories: {
    electronics: '#3b82f6',
    furniture: '#8b5cf6',
    vehicles: '#ef4444',
    realEstate: '#f59e0b',
    fashion: '#ec4899',
    sports: '#22c55e',
    books: '#06b6d4',
    pets: '#f97316',
    services: '#6366f1',
    others: '#6b7280',
  },
  
  // Chat colors
  chat: {
    sent: '#0A0F2C',
    received: '#E5E5E5',
    sentText: '#ffffff',
    receivedText: '#0A0F2C',
    timestamp: '#9ca3af',
    online: '#22c55e',
    offline: '#6b7280',
  },
  
  // Rating colors
  rating: {
    filled: '#FFD100',
    empty: '#E5E5E5',
  },
  
  // Price colors
  price: {
    original: '#ef4444',
    discounted: '#22c55e',
    negotiable: '#FFD100',
  },
  
  // Status indicator colors
  status: {
    active: '#22c55e',
    inactive: '#6b7280',
    pending: '#FFD100',
    sold: '#ef4444',
    featured: '#8b5cf6',
  },
};

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getCategoryColor = (category: string): string => {
  return colors.categories[category as keyof typeof colors.categories] || colors.categories.others;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'available':
      return colors.status.active;
    case 'sold':
    case 'completed':
      return colors.status.sold;
    case 'pending':
    case 'processing':
      return colors.status.pending;
    case 'featured':
    case 'promoted':
      return colors.status.featured;
    default:
      return colors.status.inactive;
  }
};



