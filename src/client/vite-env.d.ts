/// <reference types="vite/client" />

interface Window {
  turnstile?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        action: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "compact" | "flexible";
      }
    ) => string;
    reset: (widgetId?: string) => void;
    remove?: (widgetId: string) => void;
  };
}
