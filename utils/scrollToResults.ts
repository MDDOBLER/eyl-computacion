export function scrollToResults(offset = 120) {
  if (typeof window === "undefined") return;
  const el = document.getElementById("results");
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}
