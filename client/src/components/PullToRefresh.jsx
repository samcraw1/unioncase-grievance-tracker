import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const threshold = 80; // Distance to trigger refresh

  const handleTouchStart = (e) => {
    // Only allow pull to refresh if scrolled to top
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (refreshing || touchStartY.current === 0) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    // Only pull down
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      setPulling(true);
      // Dampen the pull effect
      setPullDistance(Math.min(distance / 2, threshold + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling) return;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPulling(false);
      setPullDistance(0);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setRefreshing(false);
      }
    } else {
      setPulling(false);
      setPullDistance(0);
    }

    touchStartY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: `${Math.max(pullDistance, refreshing ? 60 : 0)}px`,
          opacity: pulling || refreshing ? 1 : 0,
        }}
      >
        <div className={`flex items-center gap-2 text-primary ${refreshing ? 'animate-spin' : ''}`}>
          <RefreshCw className="h-5 w-5" />
          <span className="text-sm font-medium">
            {refreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pulling ? pullDistance : refreshing ? 60 : 0}px)`,
          transition: pulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
