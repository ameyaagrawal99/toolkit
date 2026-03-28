import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check as fallback (every 10 seconds)
    const intervalId = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        if (currentStatus) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`${
          isOnline
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
            : 'bg-gradient-to-r from-amber-500 to-orange-600'
        } text-white px-4 py-3 shadow-lg flex items-center justify-center gap-2`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5" />
            <span className="font-medium">You're back online!</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">You're offline - all tools still work!</span>
          </>
        )}
        <button
          onClick={() => setShowBanner(false)}
          className="ml-4 px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator;
