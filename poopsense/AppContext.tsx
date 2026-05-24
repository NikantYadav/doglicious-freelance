import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, Dog, ScanEntry, VetInfo, PDFLang } from '../types';
import { loadState, persistState } from '../utils/storage';
import { todayStr, uid } from '../utils/helpers';

// ─── Initial State ────────────────────────────────────────────────────────────

const DEFAULT_STATE: AppState = {
  dogs: [],
  curDog: 0,
  hist: {},
  vet: { name: '', num: '' },
  pdfLang: 'en',
  lang: 'en',
  startDate: null,
  subscribed: false,
  curDays: 7,
  waVerified: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; payload: Partial<AppState> }
  | { type: 'SET_CUR_DOG'; index: number }
  | { type: 'ADD_DOG'; dog: Dog }
  | { type: 'EDIT_DOG'; dog: Dog }
  | { type: 'DELETE_DOG'; id: string }
  | { type: 'ADD_ENTRY'; dogId: string; entry: ScanEntry }
  | { type: 'SET_VET'; vet: VetInfo }
  | { type: 'SET_PDF_LANG'; lang: PDFLang }
  | { type: 'ACTIVATE_TRIAL' }
  | { type: 'ACTIVATE_SUB' }
  | { type: 'SET_WA_VERIFIED'; phone: string }
  | { type: 'SET_CUR_DAYS'; days: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };

    case 'SET_CUR_DOG':
      return { ...state, curDog: action.index };

    case 'ADD_DOG': {
      const dogs = [...state.dogs, action.dog];
      const hist = { ...state.hist };
      if (!hist[action.dog.id]) hist[action.dog.id] = [];
      // Activate trial on first dog
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

    case 'SET_CUR_DAYS':
      return { ...state, curDays: action.days };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentDog: Dog | null;
  dogHistory: ScanEntry[];
  todayScans: ScanEntry[];
  addEntry: (entry: ScanEntry) => void;
  addDog: (dog: Omit<Dog, 'id'>) => Dog;
  editDog: (dog: Dog) => void;
  deleteDog: (id: string) => void;
  setVet: (vet: VetInfo) => void;
  activateSub: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    dispatch({ type: 'INIT', payload: saved });
  }, []);

  // Persist on every state change
  useEffect(() => {
    persistState(state);
  }, [state]);

  const currentDog = state.dogs[state.curDog] ?? null;

  const dogHistory = currentDog
    ? (state.hist[currentDog.id] ?? []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))
    : [];

  const todayScans = dogHistory.filter((e) => e.date === todayStr());

  const addEntry = useCallback(
    (entry: ScanEntry) => {
      if (!currentDog) return;
      dispatch({ type: 'ADD_ENTRY', dogId: currentDog.id, entry });
    },
    [currentDog],
  );

  const addDog = useCallback((data: Omit<Dog, 'id'>): Dog => {
    const dog: Dog = { ...data, id: uid() };
    dispatch({ type: 'ADD_DOG', dog });
    return dog;
  }, []);

  const editDog = useCallback((dog: Dog) => {
    dispatch({ type: 'EDIT_DOG', dog });
  }, []);

  const deleteDog = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DOG', id });
  }, []);

  const setVet = useCallback((vet: VetInfo) => {
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

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}