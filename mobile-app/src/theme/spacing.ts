export const spacing = {
  // Base spacing unit (4px)
  unit: 4,
  
  // Common spacing values
  xs: 4,   // Extra small
  sm: 8,   // Small
  md: 16,  // Medium
  lg: 24,  // Large
  xl: 32,  // Extra large
  xxl: 48, // Double extra large
  
  // Specific use cases
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  iconPadding: 8,
  
  // Component specific spacing
  header: {
    height: 56,
    padding: 16,
    statusBarHeight: 24, // Default, should be dynamic
  },
  
  tabBar: {
    height: 60,
    padding: 8,
  },
  
  card: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
  },
  
  button: {
    padding: 12,
    margin: 8,
    borderRadius: 8,
  },
  
  input: {
    padding: 12,
    margin: 8,
    borderRadius: 8,
  },
  
  list: {
    itemPadding: 16,
    sectionPadding: 24,
  },
  
  modal: {
    padding: 24,
    margin: 16,
  },
  
  // Grid spacing
  grid: {
    gutter: 16,
    column: 8,
  },
};

// Spacing utility functions
export const getSpacing = (multiplier: number): number => {
  return spacing.unit * multiplier;
};

export const getVerticalSpacing = (top: number, bottom: number): object => {
  return {
    marginTop: getSpacing(top),
    marginBottom: getSpacing(bottom),
  };
};

export const getHorizontalSpacing = (left: number, right: number): object => {
  return {
    marginLeft: getSpacing(left),
    marginRight: getSpacing(right),
  };
};

export const getPadding = (
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): object => {
  if (right === undefined) {
    // Single value - apply to all sides
    return { padding: getSpacing(top) };
  }
  
  if (bottom === undefined) {
    // Two values - vertical and horizontal
    return {
      paddingVertical: getSpacing(top),
      paddingHorizontal: getSpacing(right),
    };
  }
  
  if (left === undefined) {
    // Three values - top, horizontal, bottom
    return {
      paddingTop: getSpacing(top),
      paddingHorizontal: getSpacing(right),
      paddingBottom: getSpacing(bottom),
    };
  }
  
  // Four values - top, right, bottom, left
  return {
    paddingTop: getSpacing(top),
    paddingRight: getSpacing(right),
    paddingBottom: getSpacing(bottom),
    paddingLeft: getSpacing(left),
  };
};

export const getMargin = (
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): object => {
  if (right === undefined) {
    // Single value - apply to all sides
    return { margin: getSpacing(top) };
  }
  
  if (bottom === undefined) {
    // Two values - vertical and horizontal
    return {
      marginVertical: getSpacing(top),
      marginHorizontal: getSpacing(right),
    };
  }
  
  if (left === undefined) {
    // Three values - top, horizontal, bottom
    return {
      marginTop: getSpacing(top),
      marginHorizontal: getSpacing(right),
      marginBottom: getSpacing(bottom),
    };
  }
  
  // Four values - top, right, bottom, left
  return {
    marginTop: getSpacing(top),
    marginRight: getSpacing(right),
    marginBottom: getSpacing(bottom),
    marginLeft: getSpacing(left),
  };
};



