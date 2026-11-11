/**
 * Security Headers Configuration (SEC-01, SEC-03, NFR-02)
 *
 * Implements defensive HTTP response headers defending against:
 * - Cross-Site Scripting (XSS) via Content-Security-Policy
 * - Clickjacking via Frame Protections (X-Frame-Options & frame-ancestors)
 * - MIME-type sniffing via X-Content-Type-Options
 * - Insecure transport via Strict-Transport-Security (HSTS) in production
 * - Data leakage via Referrer-Policy and Permissions-Policy
 */

export interface SecurityHeaderItem {
  key: string;
  value: string;
}

/**
 * Generates the Content-Security-Policy (CSP) string.
 * Allows necessary asset sources (Cloudinary, Unsplash, Google Fonts) while
 * strictly blocking framing, object injection, and unauthorized remote scripts.
 */
export function buildContentSecurityPolicy(): string {
  const isProduction = process.env.NODE_ENV === 'production';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://images.unsplash.com',
      'https://res.cloudinary.com',
    ],
    'connect-src': ["'self'", 'https://api.cloudinary.com'],
    'frame-ancestors': ["'none'"], // Frame protection against clickjacking
    'object-src': ["'none'"], // Defend against plugin/Flash exploits
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  if (isProduction) {
    directives['upgrade-insecure-requests'] = [];
  }

  return Object.entries(directives)
    .map(([key, values]) => (values.length > 0 ? `${key} ${values.join(' ')}` : key))
    .join('; ');
}

/**
 * Returns the complete dictionary of security headers.
 * HSTS is included conditionally when in production or when explicitly enabled.
 */
export function getSecurityHeaders(options: { isProduction?: boolean } = {}): SecurityHeaderItem[] {
  const isProd =
    options.isProduction !== undefined
      ? options.isProduction
      : process.env.NODE_ENV === 'production';

  const headers: SecurityHeaderItem[] = [
    {
      key: 'Content-Security-Policy',
      value: buildContentSecurityPolicy(),
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY', // Frame protection
    },
    {
      key: 'X-XSS-Protection',
      value: '0', // Modern standard: disable buggy legacy auditor in favor of CSP
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
  ];

  // HSTS: Enabled in production environments (SEC-01)
  if (isProd) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}
