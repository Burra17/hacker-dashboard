"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

/**
 * Reflects the active `ui.theme` onto `<html data-theme>`, which is what the
 * CSS-variable theme blocks in globals.css key off. Renders nothing. The SSR
 * default in layout.tsx matches the store's default theme, so there's no flash.
 */
export default function ThemeSync() {
  const theme = useDashboardStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
