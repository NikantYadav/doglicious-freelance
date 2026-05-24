const PREFIX = 'ps9_';

export const LS = {
  get(key) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // quota exceeded – ignore
    }
  },
  del(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
  clear() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};

export function loadState() {
  return {
    dogs: LS.get('dogs') ?? [],
    hist: LS.get('hist') ?? {},
    vet: LS.get('vet') ?? { name: '', num: '' },
    pdfLang: LS.get('pdfLang') ?? 'en',
    lang: LS.get('lang') ?? 'en',
    startDate: LS.get('startDate') ?? null,
    subscribed: LS.get('subscribed') ?? false,
    subDate: LS.get('subDate') ?? undefined,
    waVerified: LS.get('waVerified') ?? false,
    waPhone: LS.get('waPhone') ?? undefined,
  };
}

export function persistState(state) {
  LS.set('dogs', state.dogs);
  LS.set('hist', state.hist);
  LS.set('vet', state.vet);
  LS.set('pdfLang', state.pdfLang);
  LS.set('lang', state.lang);
  if (state.startDate) LS.set('startDate', state.startDate);
  LS.set('subscribed', state.subscribed);
  if (state.subDate) LS.set('subDate', state.subDate);
  LS.set('waVerified', state.waVerified);
  if (state.waPhone) LS.set('waPhone', state.waPhone);
}
