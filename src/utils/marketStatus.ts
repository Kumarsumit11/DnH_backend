export function getMarketStatus() {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  const day = now.getDay();

  const hour = now.getHours();

  const minute = now.getMinutes();

  const totalMinutes = hour * 60 + minute;

  const isWeekend = day === 0 || day === 6;

  const isOpen =
    !isWeekend &&
    totalMinutes >= 9 * 60 + 15 &&
    totalMinutes <= 15 * 60 + 30;

  return {
    status: isOpen ? "OPEN" : "CLOSED",
    isOpen,
    lastUpdated: now.toISOString(),
  };
}