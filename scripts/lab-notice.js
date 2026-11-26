/* Signal Motion Lab — original educational deployment adapter, MIT. */
(() => {
  const title = "Signal Motion Lab — Unofficial animation study";
  const update = () => {
    document.title = title;
    if (!document.body || document.getElementById("signal-lab-notice")) return;
    const notice = document.createElement("aside");
    notice.id = "signal-lab-notice";
    notice.setAttribute("aria-label", "Educational project attribution");
    notice.style.cssText = "position:fixed;z-index:2147483647;left:12px;bottom:12px;max-width:calc(100vw - 24px);padding:8px 12px;background:#0d1012;color:#f6f8f7;border:1px solid #5b6560;border-radius:8px;font:12px/1.4 system-ui,sans-serif;box-shadow:0 2px 12px #0005";
    notice.append("Signal Motion Lab · Unofficial educational study · ");
    const credit = document.createElement("a");
    credit.href = "https://www.bonanza-studios.com/";
    credit.target = "_blank";
    credit.rel = "noopener noreferrer";
    credit.textContent = "Original: Bonanza Studios ↗";
    credit.style.cssText = "color:#2fd6ff;text-decoration:underline";
    notice.append(credit);
    document.body.append(notice);
  };
  document.addEventListener("click", event => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || link.closest("#signal-lab-notice")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener("submit", event => {
    event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  if (document.readyState === "complete") setTimeout(update, 1200);
  else window.addEventListener("load", () => setTimeout(update, 1200), {once:true});
})();
