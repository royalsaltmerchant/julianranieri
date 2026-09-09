const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderCandleLine = (value) =>
  escapeHtml(value)
    .replace("candle", '<span class="candle-word">candle</span>')
    .replace("abyss", '<span class="abyss-word">abyss</span>');

const runTypewriter = () => {
  const line = document.querySelector("[data-typewriter]");

  if (!line) return;

  const text = line.textContent.trim();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  line.setAttribute("aria-label", text);

  if (reduceMotion) {
    line.innerHTML = renderCandleLine(text);
    return;
  }

  line.classList.add("is-typing");
  line.textContent = "";

  let index = 0;
  const interval = window.setInterval(() => {
    index += 1;
    line.innerHTML = renderCandleLine(text.slice(0, index));

    if (index >= text.length) {
      window.clearInterval(interval);
      line.classList.remove("is-typing");
      line.classList.add("typing-complete");
    }
  }, 44);
};

document.addEventListener("DOMContentLoaded", runTypewriter);
