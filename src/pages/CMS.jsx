import React from 'react';
import { CmsProvider, useCms } from '../components/CMS/CmsContext';
import CmsAuth from '../components/CMS/CmsAuth';
import CmsDashboard from '../components/CMS/CmsDashboard';
import '../styles/CMS.css';

function CmsGate() {
    const { user, loading } = useCms();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 100%)',
                fontFamily: "'Poppins', sans-serif",
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
            }}>
                Loading…
            </div>
        );
    }

    if (!user) return <CmsAuth />;
    return <CmsDashboard />;
}

export default function CMS() {
    return (
        <CmsProvider>
            <CmsGate />
        </CmsProvider>
    );
}
