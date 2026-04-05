import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

let mmkv: MMKV | null = null;
try {
  mmkv = createMMKV({ id: 'app-storage' });
} catch {
  mmkv = null;
}

const memory = new Map<string, string>();

export const mmkvStorage: StateStorage = {
  getItem: (name) => {
    if (mmkv) return mmkv.getString(name) ?? null;
    return memory.get(name) ?? null;
  },
  setItem: (name, value) => {
    if (mmkv) mmkv.set(name, value);
    else memory.set(name, value);
  },
  removeItem: (name) => {
    if (mmkv) mmkv.remove(name);
    else memory.delete(name);
  },
};
