// ─── Core Domain Types ───────────────────────────────────────────────────────

export interface Dog {
  id: string;
  name: string;
  av: string;
  breed: string;
  age: string;
  months?: string;
  dob?: string; // YYYY-MM
  wt: string;
  diet?: string;
  grams?: string;
  freq?: string;
  act?: string;
  parentName: string;
  parentMobile: string;
}

export interface ScoreParams {
  color: number;
  consistency: number;
  shape: number;
  contents: number;
  riskPattern: number;
}

export interface ScanEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  ts: number;         // timestamp ms
  dstr: string;       // formatted date string
  score: number;      // 0–100
  healthScore?: number; // alias for score
  risk: 'g' | 'w' | 'c'; // green / warn / critical
  stoolType: string;
  bristolScore: number;
  color: string;
  consistency: string;
  shape?: string;
  sum: string;        // clinical summary
  simpleEn?: string;
  simpleHi?: string;
  clinicalSummary?: string;
  params?: ScoreParams;
  possibleConditions?: string[];
  recommendations?: string[];
  symptoms?: SymptomData;
  sym?: SymptomData;
  imgB64?: string;    // base64 image
  imgSrc?: string;    // data URL
  dogId?: string;
  dogName?: string;
  dogAv?: string;
  scanKey?: string;
  chips?: string[];
}

export interface SymptomData {
  diet?: string;
  water?: string;
  pain?: string;
  freq?: string;
  other?: string;
  pills?: string[];
}

export interface VetInfo {
  name: string;
  num: string;
}

export type NavTab = 'home' | 'hist' | 'scan' | 'prog' | 'settings' | 'pay';
export type ScanScreen = 's1' | 's2' | 's3' | 's4' | 's5';
export type ReportTab = 'analysis' | 'action' | 'share';
export type PDFLang = 'en' | 'hi';

export interface AppState {
  dogs: Dog[];
  curDog: number;
  hist: Record<string, ScanEntry[]>;
  vet: VetInfo;
  pdfLang: PDFLang;
  lang: PDFLang;
  startDate: string | null; // ISO date string
  trial: string | null;     // alias for startDate
  subscribed: boolean;
  subDate?: string;
  curDays: number;
  waVerified: boolean;
  waPhone?: string;
}

export interface TrialStatus {
  daysLeft: number;
  daysUsed: number;
  isExpired: boolean;
  isSubscribed: boolean;
  startDate: Date | null;
}