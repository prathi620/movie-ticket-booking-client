import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

const Alert = ({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) => {
    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const types = {
        success: {
            bg: 'bg-green-500/10 border-green-500/30',
            text: 'text-green-400',
            icon: CheckCircle,
        },
        error: {
            bg: 'bg-red-500/10 border-red-500/30',
            text: 'text-red-400',
            icon: AlertCircle,
        },
        warning: {
            bg: 'bg-yellow-500/10 border-yellow-500/30',
            text: 'text-yellow-400',
            icon: AlertTriangle,
        },
        info: {
            bg: 'bg-blue-500/10 border-blue-500/30',
            text: 'text-blue-400',
            icon: Info,
        },
    };

    const config = types[type];
    const Icon = config.icon;

    return (
        <div className={`${config.bg} ${config.text} border rounded-lg p-4 flex items-start space-x-3 animate-fadeIn`}>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;
