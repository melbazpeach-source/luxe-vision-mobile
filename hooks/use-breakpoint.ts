import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= BREAKPOINTS.desktop
      ? 'desktop'
      : width >= BREAKPOINTS.tablet
      ? 'tablet'
      : 'mobile';

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const isWide = isTablet || isDesktop; // tablet or desktop

  // Content max widths
  const contentMaxWidth = isDesktop ? 1200 : isTablet ? 900 : width;
  const sidebarWidth = isDesktop ? 240 : isTablet ? 200 : 0;
  const mainContentWidth = isWide ? contentMaxWidth - sidebarWidth : width;

  // Column counts for grids
  const galleryColumns = isDesktop ? 4 : isTablet ? 3 : 2;
  const cardColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    contentMaxWidth,
    sidebarWidth,
    mainContentWidth,
    galleryColumns,
    cardColumns,
  };
}
