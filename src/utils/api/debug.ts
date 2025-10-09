// One-file debug utilities for RN ↔ Node-JOD

import { Platform } from 'react-native';

// ====== CONFIG: choose your active host here ======
export const PORT = 3005;                                 // <- confirm this matches your server!
export const LAN_HOST = '192.168.0.117';                  // <- the LAN IP your server printed
export const EMULATOR_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// Use one of these two lines:
// export const HOST = EMULATOR_HOST;                        // emulator/simulator
export const HOST = LAN_HOST;                          // real phone on same Wi-Fi

// ====== Derived constants ======
// export const BASE_URL = `http://${HOST}:${PORT}`;
export const BASE_URL = `https://node-jod.onrender.com`;

export const PING_PATH = '/api/ping';
export const PING_URL = `${BASE_URL}${PING_PATH}`;

// ====== Logging helpers ======
export const DEBUG_API_BASE_TAG = '[DebugAPI]';
export const buildDebugApiTag = (context?: string) =>
  context ? `[DebugAPI:${context}]` : DEBUG_API_BASE_TAG;

// ====== Real ping with verbose logging ======
export async function pingOnce() {
  const started = Date.now();
  const envInfo = `platform=${Platform.OS} host=${HOST} port=${PORT}`;
  console.log(`[ping] GET ${PING_URL} (${envInfo})`);

  try {
    const res = await fetch(PING_URL);
    const text = await res.text();
    const ms = Date.now() - started;
    console.log(`[ping] status=${res.status} • ${ms}ms • body="${text}"`);
    return { ok: res.ok, status: res.status, text, ms, url: PING_URL };
  } catch (e: any) {
    const ms = Date.now() - started;
    const name = e?.name ?? 'Error';
    const msg = e?.message ?? String(e);
    console.warn(`[ping] FAILED • ${ms}ms • ${name}: ${msg}`);
    return { ok: false, status: 0, error: `${name}: ${msg}`, ms, url: PING_URL };
  }
}

// ====== Keep the same API your button calls ======
export function debugApiPlaceholder(context?: string) {
  const tag = buildDebugApiTag(context);
  console.log(`${tag} → ping ${PING_URL}`);
  pingOnce()
    .then((r) => {
      if (r.ok) console.log(`${tag} result ✓ status=${r.status}`);
      else console.warn(`${tag} result ✗ ${r.error}`);
    })
    .catch((err) => console.warn(`${tag} unexpected error`, err));
}
