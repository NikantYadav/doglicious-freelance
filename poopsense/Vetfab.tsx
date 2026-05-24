import React from 'react';
import { WhatsAppIcon } from '../shared/Icons';
import { useApp } from '../../context/AppContext';
import { ScanEntry, Dog } from '../../types';

interface Props {
  visible: boolean;
  currentEntry: ScanEntry | null;
}

const VetFAB: React.FC<Props> = ({ visible, currentEntry }) => {
  const { state } = useApp();

  if (!visible || !currentEntry) return null;

  const handleShare = () => {
    const dog: Dog | null = state.dogs[state.curDog] || null;
    const vetNum = state.vet?.num || '';
    const summary =
      (currentEntry as any).sum ||
      (currentEntry as any).clinicalSummary ||
      'PoopSense AI report available.';
    const dogName = dog?.name || 'my dog';
    const score = currentEntry.score || '?';

    const msg = encodeURIComponent(
      `[PoopSense AI] Hello Dr. ${state.vet?.name || 'Doctor'},\n\n` +
        `Dog: ${dogName}${dog?.breed ? ` (${dog.breed})` : ''} | ${dog ? `${(dog as any).age || '?'}yr` : '?'} | ${dog?.wt || '?'}kg\n` +
        (dog ? `Parent: ${(dog as any).parentName || ''}${(dog as any).parentMobile ? ` (+91 ${(dog as any).parentMobile})` : ''}\n` : '') +
        `\nHealth Score: ${score}/100\n\n` +
        `Summary: ${summary}\n\n` +
        `Note: AI only - please verify clinically.\n` +
        `-- PoopSense AI by Doglicious.in`
    );

    let num = vetNum.replace(/\D/g, '');
    if (num.length === 10) num = '91' + num;
    if (!num) num = '919889887980';

    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <button id="vetFAB" className="vet-fab" style={{ display: 'flex' }} onClick={handleShare}>
      <WhatsAppIcon />
      Share to Vet
    </button>
  );
};

export default VetFAB;