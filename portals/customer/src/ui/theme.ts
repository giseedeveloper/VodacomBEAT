import type { ThemeConfig } from "antd";

/**
 * BizTune / Vodacom brand tokens.
 *
 * Previously the portal had NO ConfigProvider, so antd fell back to its default
 * blue (#1677ff) everywhere an inline `#E60000` override didn't reach (focus
 * rings, links, Radio/Checkbox accents, Steps). Wrapping the app in
 * <ConfigProvider theme={biztuneTheme}> makes every antd component inherit
 * Vodacom red instead.
 */
export const VODACOM_RED = "#E60000";
export const VODACOM_RED_DEEP = "#8a0000";
export const CARD_BG = "#f9f9f9";
export const INK = "#23191b";
export const INK_SOFT = "#75656a";
export const LINE = "#dcccce";

export const biztuneTheme: ThemeConfig = {
  token: {
    colorPrimary: VODACOM_RED,
    colorInfo: VODACOM_RED,
    colorLink: VODACOM_RED,
    colorLinkHover: VODACOM_RED_DEEP,
    borderRadius: 12,
    fontSize: 15,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};
