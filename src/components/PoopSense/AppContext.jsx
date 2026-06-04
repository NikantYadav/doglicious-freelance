import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { loadState, persistState } from './storage';
import { todayStr, uid } from './helpers';
import { psSaveDogs, psSaveSettings, psSaveScan } from './psService';

// ─── Initial State ────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  dogs: [],
  curDog: 0,
  hist: {},
  vet: { name: '', num: '' },
  pdfLang: 'en',
  lang: 'en',
  startDate: null,
  memberSince: null,
  subscribed: false,
  curDays: 7,
  waVerified: false,
  phone: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };

    case 'SET_CUR_DOG':
      return { ...state, curDog: action.index };

    case 'ADD_DOG': {
      const dogs = [...state.dogs, action.dog];
      const hist = { ...state.hist };
      if (!hist[action.dog.id]) hist[action.dog.id] = [];
      const startDate = state.startDate ?? new Date().toISOString();
      return { ...state, dogs, hist, curDog: dogs.length - 1, startDate };
    }

    case 'EDIT_DOG': {
      const dogs = state.dogs.map((d) => (d.id === action.dog.id ? action.dog : d));
      return { ...state, dogs };
    }

    case 'DELETE_DOG': {
      const dogs = state.dogs.filter((d) => d.id !== action.id);
      const hist = { ...state.hist };
      delete hist[action.id];
      const curDog = Math.max(0, Math.min(state.curDog, dogs.length - 1));
      return { ...state, dogs, hist, curDog };
    }

    case 'ADD_ENTRY': {
      const existing = state.hist[action.dogId] ?? [];
      const hist = { ...state.hist, [action.dogId]: [action.entry, ...existing] };
      return { ...state, hist };
    }

    case 'SET_VET':
      return { ...state, vet: action.vet };

    case 'SET_PDF_LANG':
      return { ...state, pdfLang: action.lang, lang: action.lang };

    case 'ACTIVATE_TRIAL':
      return { ...state, startDate: state.startDate ?? new Date().toISOString() };

    case 'ACTIVATE_SUB':
      return { ...state, subscribed: true, subDate: new Date().toISOString() };

    case 'SET_WA_VERIFIED':
      return { ...state, waVerified: true, waPhone: action.phone };

    case 'SET_PHONE':
      return { ...state, phone: action.phone };

    case 'SET_CUR_DAYS':
      return { ...state, curDays: action.days };

    case 'RESET':
      return { ...DEFAULT_STATE };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    dispatch({ type: 'INIT', payload: saved });
  }, []);

  // Persist to localStorage — debounced so rapid state changes don't thrash storage
  const persistTimer = useRef(null);
  useEffect(() => {
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      persistState(state);
    }, 300);
    return () => clearTimeout(persistTimer.current);
  }, [state]);

  // Sync dogs to Supabase whenever dogs array changes (debounced)
  useEffect(() => {
    if (!state.phone || state.dogs.length === 0) return;
    const t = setTimeout(() => {
      psSaveDogs(state.phone, state.dogs).catch(e =>
        console.warn('[AppContext] psSaveDogs failed (non-fatal):', e.message)
      );
    }, 1500);
    return () => clearTimeout(t);
  }, [state.dogs, state.phone]);

  // Sync settings to Supabase when vet/lang/sub changes (debounced)
  useEffect(() => {
    if (!state.phone) return;
    const t = setTimeout(() => {
      psSaveSettings(state.phone, {
        vetName: state.vet.name,
        vetNum: state.vet.num,
        pdfLang: state.pdfLang,
        subscribed: state.subscribed,
        subDate: state.subDate || null,
        startDate: state.startDate || null,
      }).catch(e =>
        console.warn('[AppContext] psSaveSettings failed (non-fatal):', e.message)
      );
    }, 1500);
    return () => clearTimeout(t);
  }, [state.vet, state.pdfLang, state.subscribed, state.subDate, state.startDate, state.phone]);

  const currentDog = state.dogs[state.curDog] ?? null;

  const dogHistory = currentDog
    ? (state.hist[currentDog.id] ?? []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))
    : [];

  const todayScans = dogHistory.filter((e) => e.date === todayStr());

  const addEntry = useCallback(
    (entry) => {
      if (!currentDog) return;
      dispatch({ type: 'ADD_ENTRY', dogId: currentDog.id, entry });
      // Sync to Supabase non-blocking
      if (state.phone) {
        psSaveScan(state.phone, entry, currentDog.id).catch(e =>
          console.warn('[AppContext] psSaveScan failed (non-fatal):', e.message)
        );
      }
    },
    [currentDog, state.phone],
  );

  const addDog = useCallback((data) => {
    const dog = { ...data, id: uid() };
    dispatch({ type: 'ADD_DOG', dog });
    return dog;
  }, []);

  const editDog = useCallback((dog) => {
    dispatch({ type: 'EDIT_DOG', dog });
  }, []);

  const deleteDog = useCallback((id) => {
    dispatch({ type: 'DELETE_DOG', id });
  }, []);

  const setVet = useCallback((vet) => {
    dispatch({ type: 'SET_VET', vet });
  }, []);

  const activateSub = useCallback(() => {
    dispatch({ type: 'ACTIVATE_SUB' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        currentDog,
        dogHistory,
        todayScans,
        addEntry,
        addDog,
        editDog,
        deleteDog,
        setVet,
        activateSub,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
