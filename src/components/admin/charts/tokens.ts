/**
 * Chart colours for the admin dashboard.
 *
 * Validated with the dataviz palette validator against the light surface:
 * lightness band PASS · chroma floor PASS · CVD separation PASS · contrast PASS.
 * Tritan separation sits in the 8–12 floor band, which is only legal with a
 * secondary encoding — every status is therefore always shown with a text
 * label, never colour alone.
 */
export const CHART = {
  gold: "#a97f2f", // brand / primary single-series hue
  green: "#2f7d4f", // good
  blue: "#3d6ea8", // in transit
  red: "#c0392b", // critical
  neutral: "#9c9188", // inert / waiting
} as const;

/** Status is a reserved palette — never reused for "series N". */
export const STATUS_COLOR: Record<string, string> = {
  pending: CHART.neutral,
  confirmed: CHART.gold,
  processing: CHART.gold,
  packed: CHART.gold,
  shipped: CHART.blue,
  delivered: CHART.green,
  cancelled: CHART.red,
  refunded: CHART.red,
  returned: CHART.red,
  // payment
  unpaid: CHART.neutral,
  partial: CHART.gold,
  paid: CHART.green,
  failed: CHART.red,
  // reviews
  published: CHART.green,
  rejected: CHART.red,
};

export const statusColor = (s: string) => STATUS_COLOR[s] ?? CHART.neutral;
