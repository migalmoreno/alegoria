export const formatNumber = (val: number) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val);

export const formatTimeAgo = (
  date: Date,
  options: Intl.RelativeTimeFormatOptions = { style: "long" },
) => {
  const elapsed = date.getTime() - Date.now();
  const units = {
    year: 31536000000,
    month: 2628000000,
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000,
  };
  const rtf = new Intl.RelativeTimeFormat("en", options);

  for (const [unit, amount] of Object.entries(units)) {
    if (Math.abs(elapsed) > amount || unit === "second") {
      return rtf.format(
        Math.round(elapsed / amount),
        unit as Intl.RelativeTimeFormatUnit,
      );
    }
  }
};
