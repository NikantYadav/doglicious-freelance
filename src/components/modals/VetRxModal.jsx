import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// When "opened", immediately navigate to /vetrxscan instead of showing a modal.
export default function VetRxModal({ isOpen, onClose }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            onClose();           // reset modal state
            navigate('/vetrxscan');
        }
    }, [isOpen]);

    return null;
}
