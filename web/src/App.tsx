import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Timeframe, Candle, Quote, IndicatorConfig } from './types';
import {
  fetchDnseCandles,
  fetchDnseQuote,
  SECTOR_WATCHLISTS,
} from './services/dnseApi';
import { CockpitHeader } from './components/CockpitHeader';
import { WatchlistRibbon } from './components/WatchlistRibbon';
import { TradingViewChart } from './components/TradingViewChart';
import { DriverControls } from './components/DriverControls';
import { MiniPriceboardTable } from './components/MiniPriceboardTable';
import { SymbolSearchModal } from './components/SymbolSearchModal';

const DEFAULT_FAVORITES = ['HSG', 'HUT', 'NVL', 'KBC', 'SSI', 'CMG'];

export const App: React.FC = () => {
  const [activeSymbol, setActiveSymbol] = useState<string>('HSG');
  const [timeframe, setTimeframe] = useState<Timeframe>('15');
  const [selectedSector, setSelectedSector] = useState<string>('favorites');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [quotesMap, setQuotesMap] = useState<Record<string, Quote>>({});
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Indicators toggle state
  const [indicators, setIndicators] = useState<IndicatorConfig>({
    superTrend: true,
    ema20: true,
    ema50: false,
    volume: true,
  });

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dnse_otr_favorites_v2');
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  });

  // Responsive Layout detection (Portrait vs Landscape, Narrow Split-screen)
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  const [isNarrow, setIsNarrow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsNarrow(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dnse_otr_favorites_v2', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites:', e);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((sym: string) => {
    setFavorites((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  }, []);

  // Active symbols list based on selected sector
  const currentSymbols = useMemo(() => {
    if (selectedSector === 'favorites') {
      return favorites.length > 0 ? favorites : DEFAULT_FAVORITES;
    }
    const found = SECTOR_WATCHLISTS.find((s) => s.id === selectedSector);
    return found ? found.symbols : SECTOR_WATCHLISTS[0].symbols;
  }, [selectedSector, favorites]);

  // Load candles for active symbol & timeframe
  const loadCandles = useCallback(async (sym: string, tf: Timeframe) => {
    setIsLoading(true);
    try {
      const data = await fetchDnseCandles(sym, tf);
      setCandles(data);
    } catch (err) {
      console.error('Failed to load DNSE candles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandles(activeSymbol, timeframe);
  }, [activeSymbol, timeframe, loadCandles]);

  // Load quotes for all symbols in the current sector
  useEffect(() => {
    let isCancelled = false;

    const fetchSectorQuotes = async () => {
      for (const sym of currentSymbols) {
        if (isCancelled) break;
        try {
          const q = await fetchDnseQuote(sym);
          if (q && !isCancelled) {
            setQuotesMap((prev) => ({ ...prev, [sym]: q }));
          }
        } catch {
          // ignore single quote errors
        }
      }
    };

    fetchSectorQuotes();

    // Auto refresh active quotes every 5 seconds
    const interval = setInterval(async () => {
      try {
        const q = await fetchDnseQuote(activeSymbol);
        if (q) {
          setQuotesMap((prev) => ({ ...prev, [activeSymbol]: q }));
        }
      } catch {
        // ignore
      }
    }, 5000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [currentSymbols, activeSymbol]);

  // Auto-Play: rotate to next stock every 10 seconds
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      const idx = currentSymbols.indexOf(activeSymbol);
      const nextIdx = (idx + 1) % currentSymbols.length;
      setActiveSymbol(currentSymbols[nextIdx]);
    }, 10000);

    return () => clearInterval(timer);
  }, [isAutoPlay, currentSymbols, activeSymbol]);

  const toggleIndicator = (key: keyof IndicatorConfig) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeQuote = quotesMap[activeSymbol] || null;
  const isCurrentFav = favorites.includes(activeSymbol);

  return (
    <div className="w-screen h-[100dvh] max-h-[100dvh] flex flex-col bg-car-black text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header (HUD Price, Candle stats, Actions) */}
      <CockpitHeader
        quote={activeQuote}
        hoverCandle={hoverCandle}
        symbol={activeSymbol}
        isAutoPlay={isAutoPlay}
        onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRefresh={() => loadCandles(activeSymbol, timeframe)}
        isRefreshing={isLoading}
        isNarrow={isNarrow}
      />

      {/* 2. Watchlist Ribbon (Sectors & Horizontal Stock Cards) */}
      <WatchlistRibbon
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        symbols={currentSymbols}
        activeSymbol={activeSymbol}
        onSelectSymbol={setActiveSymbol}
        quotesMap={quotesMap}
        favorites={favorites}
      />

      {/* 3. Main Center Stage: Chart (+ Mini Priceboard in Portrait/Split-screen) */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-car-black">
        {/* Loading Indicator Overlay */}
        {isLoading && (
          <div className="absolute top-3 right-3 z-20 bg-car-card/80 border border-car-border/80 px-2.5 py-1 rounded-lg text-xs font-bold text-car-cyan flex items-center gap-1.5 shadow-md backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-car-cyan animate-ping" />
            <span>Đang nạp DNSE...</span>
          </div>
        )}

        {/* Chart Viewport */}
        <div className={`w-full ${isPortrait ? 'h-[50%] min-h-[180px]' : 'h-full flex-1'}`}>
          <TradingViewChart
            candles={candles}
            symbol={activeSymbol}
            indicators={indicators}
            onHoverCandle={setHoverCandle}
          />
        </div>

        {/* Mini Priceboard Table: displayed when in Portrait mode or Half-screen mode! */}
        {isPortrait && (
          <MiniPriceboardTable
            symbols={currentSymbols}
            activeSymbol={activeSymbol}
            onSelectSymbol={setActiveSymbol}
            quotesMap={quotesMap}
          />
        )}
      </main>

      {/* 4. Bottom Driver Controls (Timeframes, Indicators, Star) */}
      <DriverControls
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
        indicators={indicators}
        onToggleIndicator={toggleIndicator}
        isFavorite={isCurrentFav}
        onToggleFavorite={() => toggleFavorite(activeSymbol)}
        isNarrow={isNarrow}
      />

      {/* 5. Symbol Search & Sector Picker Modal */}
      <SymbolSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSymbol={setActiveSymbol}
        activeSymbol={activeSymbol}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        quotesMap={quotesMap}
      />
    </div>
  );
};

export default App;
