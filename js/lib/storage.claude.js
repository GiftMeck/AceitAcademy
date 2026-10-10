/**
 * Storage used only by the single-file preview that runs inside Claude.
 * The build script swaps this in for storage.js. Not used on the real website.
 */
const memory = {};

export async function loadData(key) {
  try {
    if (window.storage) {
      const r = await window.storage.get(key, false);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) { /* nothing saved yet */ }
  return memory[key] ? JSON.parse(memory[key]) : null;
}

export async function saveData(key, value) {
  const raw = JSON.stringify(value);
  memory[key] = raw;
  try { if (window.storage) await window.storage.set(key, raw, false); } catch (e) { /* storage unavailable */ }
}
