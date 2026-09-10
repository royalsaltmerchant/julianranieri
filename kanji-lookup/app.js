const kanjiData = {};
const shardCache = new Map();

const kanjiInput = document.querySelector("#kanji-input");
const results = document.querySelector("#kanji-results");
const kanjiCount = document.querySelector("#kanji-count");
const characterCount = document.querySelector("#character-count");
const wordResults = document.querySelector("#word-results");
const wordCount = document.querySelector("#word-count");
let kanjiRenderVersion = 0;
let wordRenderVersion = 0;
let wordTimer;
const wordDataCache = new Map();

function uniqueKanji(text) {
  return [...new Set([...text].filter((char) => /\p{Script=Han}/u.test(char)))];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bucketFor(text) {
  return (text.codePointAt(0) & 255).toString(16).padStart(2, "0");
}

async function loadShard(text) {
  const bucket = bucketFor(text);
  if (!shardCache.has(bucket)) {
    shardCache.set(bucket, fetch(`./data/${bucket}.json`).then((response) => {
      if (!response.ok) throw new Error("Dictionary data could not be loaded");
      return response.json();
    }));
  }
  return shardCache.get(bucket);
}

function kanjiCard(char, item) {
  const meaning = item?.meaning || (item === null ? "Lookup unavailable" : "Looking up…");
  const on = item?.on || (item === null ? "Unavailable" : "Loading");
  const kun = item?.kun || (item === null ? "Unavailable" : "Loading");
  return `<div class="kanji-card">
    <span class="kanji-glyph" lang="ja">${escapeHtml(char)}</span>
    <div class="kanji-info">
      <strong>${escapeHtml(meaning)}</strong>
      <span>On: ${escapeHtml(on)}</span>
      <span>Kun: ${escapeHtml(kun)}</span>
    </div>
  </div>`;
}

async function loadKanji(char) {
  if (Object.hasOwn(kanjiData, char)) return kanjiData[char];
  try {
    const shard = await loadShard(char);
    const data = shard.k[char];
    if (!data) throw new Error("Kanji not found");
    kanjiData[char] = {
      meaning: data[0]?.join(" · ") || "Meaning unavailable",
      on: data[1]?.join("、") || "—",
      kun: data[2]?.join("、") || "—",
      strokes: data[3] ?? null
    };
  } catch (error) {
    kanjiData[char] = null;
  }
  return kanjiData[char];
}

async function renderKanji() {
  const version = ++kanjiRenderVersion;
  const text = kanjiInput.value;
  const found = uniqueKanji(text);
  characterCount.textContent = `${[...text].length} character${[...text].length === 1 ? "" : "s"}`;
  kanjiCount.textContent = `${found.length} unique`;

  if (!found.length) {
    results.innerHTML = '<div class="empty">No kanji found yet. Try pasting some Japanese text.</div>';
    return;
  }

  results.innerHTML = found.map((char, index) => kanjiCard(char, kanjiData[char], index)).join("");

  const missing = found.filter((char) => !Object.hasOwn(kanjiData, char));
  if (!missing.length) return;
  await Promise.all(missing.map(loadKanji));
  if (version !== kanjiRenderVersion) return;
  results.innerHTML = found.map((char, index) => kanjiCard(char, kanjiData[char], index)).join("");
}

function japaneseWords(text) {
  if (!text.trim()) return [];
  if (!Intl.Segmenter) {
    return [...new Set(text.match(/[\p{Script=Han}]+/gu) || [])];
  }
  return [...new Set([...new Intl.Segmenter("ja", { granularity: "word" }).segment(text)]
    .filter(({ segment, isWordLike }) => isWordLike && /\p{Script=Han}/u.test(segment))
    .map(({ segment }) => segment))];
}

async function loadWord(word) {
  if (wordDataCache.has(word)) return wordDataCache.get(word);
  try {
    const shard = await loadShard(word);
    const records = shard.w[word];
    if (!records?.length) {
      wordDataCache.set(word, null);
      return null;
    }
    const readings = [...new Set(records.flatMap((record) => record[0]))];
    const glosses = [...new Set(records.flatMap((record) => record[1]))];
    const item = {
      reading: readings.slice(0, 2).join(" · ") || "—",
      meaning: glosses.slice(0, 4).join("; ") || "Meaning unavailable",
      priority: Math.max(0, ...records.map((record) => record[2] || 0))
    };
    wordDataCache.set(word, item);
    return item;
  } catch (error) {
    wordDataCache.set(word, null);
    return null;
  }
}

async function resolveSegmentWords(segment) {
  const exact = await loadWord(segment);
  if (exact || [...segment].length === 1) return [{ word: segment, item: exact }];

  const chars = [...segment];
  const memo = new Map();

  async function solve(position) {
    if (position === chars.length) return { score: 0, parts: [] };
    if (memo.has(position)) return memo.get(position);

    let best = null;
    for (let end = chars.length; end > position; end -= 1) {
      const word = chars.slice(position, end).join("");
      const item = await loadWord(word);
      if (!item) continue;
      const rest = await solve(end);
      const length = end - position;
      const score = rest.score + (length * length * 100) + (item.priority * 5);
      if (!best || score > best.score) {
        best = { score, parts: [{ word, item }, ...rest.parts] };
      }
    }

    if (!best) {
      const rest = await solve(position + 1);
      best = { score: rest.score - 100, parts: [{ word: chars[position], item: null }, ...rest.parts] };
    }
    memo.set(position, best);
    return best;
  }

  return (await solve(0)).parts;
}

function wordRow(word, item) {
  const reading = item?.reading || (item === null ? "—" : "Looking up…");
  const meaning = item?.meaning || (item === null ? "No dictionary entry found" : "");
  return `<div class="word-row">
    <span class="word-written" lang="ja">${escapeHtml(word)}</span>
    <span class="word-reading" lang="ja">${escapeHtml(reading)}</span>
    <span class="word-meaning">${escapeHtml(meaning)}</span>
  </div>`;
}

async function renderWords() {
  const version = ++wordRenderVersion;
  const segments = japaneseWords(kanjiInput.value);
  wordCount.textContent = `${segments.length} found`;
  if (!segments.length) {
    wordResults.innerHTML = '<div class="empty">No words with kanji found.</div>';
    return [];
  }
  wordResults.innerHTML = segments.map((word) => wordRow(word, wordDataCache.get(word))).join("");
  const words = (await Promise.all(segments.map(resolveSegmentWords))).flat();
  if (version !== wordRenderVersion) return [];
  wordCount.textContent = `${words.length} found`;
  wordResults.innerHTML = words.map(({ word, item }) => wordRow(word, item)).join("");
  return words;
}

function analyzeInput() {
  renderKanji();
  clearTimeout(wordTimer);
  wordTimer = setTimeout(renderWords, 180);
}

kanjiInput.addEventListener("input", analyzeInput);
document.querySelector("#clear-kanji").addEventListener("click", () => {
  kanjiInput.value = "";
  kanjiInput.focus();
  analyzeInput();
});

renderKanji();
renderWords();

function registerModelTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const register = (tool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});

  register({
    name: "analyze_japanese_text",
    title: "Analyze Japanese text",
    description: "Identify Japanese words and kanji, then show their readings and meanings in the visible app.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string", minLength: 1, maxLength: 500 } },
      required: ["text"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      if (!input || typeof input.text !== "string" || !input.text.trim() || input.text.length > 500) throw new Error("text must be 1–500 characters");
      kanjiInput.value = input.text;
      const [, words] = await Promise.all([renderKanji(), renderWords()]);
      return {
        words: words.map(({ word, item }) => ({ word, ...(item || { meaning: "Lookup unavailable" }) })),
        kanji: uniqueKanji(input.text).map((character) => ({ character, ...(kanjiData[character] || { meaning: "Lookup unavailable" }) }))
      };
    }
  });

}

registerModelTools();
