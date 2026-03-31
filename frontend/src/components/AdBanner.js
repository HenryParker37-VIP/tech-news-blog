import React, { useEffect, useRef } from 'react';

function AdBanner({ slot = '', format = 'auto', style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded - show placeholder
    }
  }, []);

  // In development, show a placeholder
  if (!slot || process.env.NODE_ENV === 'development') {
    return (
      <div
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm"
        style={{ minHeight: '90px', ...style }}
      >
        Ad Space - Google AdSense
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-3342068807259087"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

export default AdBanner;
