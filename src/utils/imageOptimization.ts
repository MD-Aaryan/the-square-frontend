/**
 * Image optimization utilities for performance
 * Provides WebP support, responsive sizing, and proper attributes
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "high" | "medium" | "low";
  format?: "auto" | "webp" | "jpg";
}

/**
 * Optimize Cloudinary URLs with WebP support and responsive sizing
 * Falls back to original URL if not Cloudinary
 */
export const optimizeImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!url || !url.includes("cloudinary")) return url;

  const {
    width = 500,
    height = 400,
    quality = "auto",
    format = "auto",
  } = options;

  const qualityMap = { auto: "auto", high: 95, medium: 80, low: 60 };
  const qValue = qualityMap[quality];

  // Build optimization string: w_500,h_400,c_fill,f_auto,q_auto
  const optimizations = `w_${width},h_${height},c_fill,f_${format},q_${qValue}`;

  return url.replace("/upload/", `/upload/${optimizations}/`);
};

/**
 * Get WebP version of image URL (for picture element srcset)
 */
export const getWebPUrl = (
  url: string,
  width: number = 500,
  height: number = 400
): string => {
  return optimizeImageUrl(url, {
    width,
    height,
    format: "webp",
    quality: "auto",
  });
};

/**
 * Get responsive image dimensions based on viewport
 */
export const getResponsiveImageDimensions = (screenWidth: number) => {
  if (screenWidth < 640) return { width: 300, height: 240 };
  if (screenWidth < 1024) return { width: 400, height: 320 };
  return { width: 500, height: 400 };
};

/**
 * Calculate aspect ratio for aspect-ratio CSS property
 */
export const getAspectRatio = (width: number, height: number): string => {
  return `${width} / ${height}`;
};

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (
  url: string,
  baseWidth: number = 500,
  baseHeight: number = 400
): string => {
  if (!url.includes("cloudinary")) return url;

  const widths = [300, 400, 500, 600];
  return widths
    .map((w) => {
      const h = Math.round((w / baseWidth) * baseHeight);
      return `${optimizeImageUrl(url, { width: w, height: h })} ${w}w`;
    })
    .join(", ");
};
