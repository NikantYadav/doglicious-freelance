import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const CmsContext = createContext(null);

export function CmsProvider({ children }) {
    const [user, setUser]       = useState(null);   // null = not logged in
    const [loading, setLoading] = useState(true);   // initial session check

    // ── Session persistence ──────────────────────────────────────────
    const getToken = () => localStorage.getItem('cms_token');
    const saveToken = (t) => localStorage.setItem('cms_token', t);
    const clearToken = () => localStorage.removeItem('cms_token');

    // ── Verify existing session on mount ────────────────────────────
    useEffect(() => {
        const token = getToken();
        if (!token) { setLoading(false); return; }

        fetch(`${API}/api/cms/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.ok) setUser(data.user);
                else clearToken();
            })
            .catch(() => clearToken())
            .finally(() => setLoading(false));
    }, []);

    // ── Auth actions ─────────────────────────────────────────────────
    const register = useCallback(async ({ email, password, name }) => {
        const r = await fetch(`${API}/api/cms/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Registration failed');
        return data;
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const r = await fetch(`${API}/api/cms/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Login failed');
        saveToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(async () => {
        const token = getToken();
        if (token) {
            fetch(`${API}/api/cms/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
        }
        clearToken();
        setUser(null);
    }, []);

    // ── Authenticated fetch helper ───────────────────────────────────
    const authFetch = useCallback(async (path, options = {}) => {
        const token = getToken();
        const r = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await r.json();
        if (r.status === 401) {
            clearToken();
            setUser(null);
            throw new Error('Session expired. Please log in again.');
        }
        if (!r.ok) throw new Error(data.error || 'Request failed');
        return data;
    }, []);

    return (
        <CmsContext.Provider value={{ user, loading, register, login, logout, authFetch }}>
            {children}
        </CmsContext.Provider>
    );
}

export function useCms() {
    const ctx = useContext(CmsContext);
    if (!ctx) throw new Error('useCms must be used inside CmsProvider');
    return ctx;
}
