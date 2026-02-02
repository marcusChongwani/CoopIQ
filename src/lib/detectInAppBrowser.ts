/**
 * Detects if the user is in an in-app browser (TikTok, Instagram, Facebook, etc.)
 */
export const detectInAppBrowser = (): { isInApp: boolean; browserName: string | null } => {
  if (typeof navigator === "undefined") {
    return { isInApp: false, browserName: null };
  }

  const ua = navigator.userAgent || navigator.vendor || "";

  const inAppPatterns: { pattern: RegExp; name: string }[] = [
    { pattern: /TikTok|musical_ly/i, name: "TikTok" },
    { pattern: /Instagram/i, name: "Instagram" },
    { pattern: /FBAN|FBAV/i, name: "Facebook" },
    { pattern: /Twitter|X App/i, name: "Twitter/X" },
    { pattern: /Snapchat/i, name: "Snapchat" },
    { pattern: /LinkedInApp/i, name: "LinkedIn" },
    { pattern: /Pinterest/i, name: "Pinterest" },
    { pattern: /Line\//i, name: "Line" },
    { pattern: /WeChat|MicroMessenger/i, name: "WeChat" },
    { pattern: /Telegram/i, name: "Telegram" },
  ];

  for (const { pattern, name } of inAppPatterns) {
    if (pattern.test(ua)) {
      return { isInApp: true, browserName: name };
    }
  }

  return { isInApp: false, browserName: null };
};

export const isInAppBrowser = (): boolean => detectInAppBrowser().isInApp;
