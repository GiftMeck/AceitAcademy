/**
 * Saving data in the browser.
 *
 * Today everything is saved on the student's own device. When aceitacademy gets
 * a real backend, implement authenticated services, permissions, data validation
 * and synchronization. This adapter is only a local prototype persistence layer.
 */
const memory = {};

export async function loadData(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* private mode or blocked storage: fall back to memory */ }
  return memory[key] ? JSON.parse(memory[key]) : null;
}

export async function saveData(key, value) {
  const raw = JSON.stringify(value);
  memory[key] = raw;
  try { window.localStorage.setItem(key, raw); } catch (e) { /* storage full or blocked */ }
}
