import React from 'react';
import { Quote, Candle } from '../types';
import { Search, Play, Pause, RefreshCw, Maximize2, Zap } from 'lucide-react';

interface Props {
  quote: Quote | null;
  hoverCandle: Candle | null;
  symbol: string;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isNarrow?: boolean;
}

export const CockpitHeader: React.FC<Props> = ({
  quote,
  hoverCandle,
  symbol,
  isAutoPlay,
  onToggleAutoPlay,
  onOpenSearch,
  onRefresh,
  isRefreshing,
  isNarrow = false,
}) => {
  // If user is hovering over a candle, show that candle's price, else show live quote
  const displayPrice = hoverCandle ? hoverCandle.close : quote?.price ?? 0;
  const isUp = (quote?.change ?? 0) >= 0;
  const priceColor = isUp ? 'text-car-green' : 'text-car-red';
  const badgeBg = isUp ? 'bg-emerald-950/80 text-car-green border-emerald-500/40' : 'bg-rose-950/80 text-car-red border-rose-500/40';

  const formatVol = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toString();
  };

  const highVal = hoverCandle ? hoverCandle.high : quote?.high ?? 0;
  const lowVal = hoverCandle ? hoverCandle.low : quote?.low ?? 0;
  const openVal = hoverCandle ? hoverCandle.open : quote?.open ?? 0;
  const volVal = hoverCandle ? hoverCandle.volume : quote?.volume ?? 0;

  return (
    <header className="bg-car-card border-b border-car-border px-3 py-2 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2 shadow-lg select-none">
      {/* Left: Stock Identity & Live Price */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 bg-car-card-hover hover:bg-slate-700/60 active:scale-95 transition-all text-white font-black text-xl sm:text-2xl px-3 py-1.5 rounded-xl border border-car-border shrink-0 shadow-inner"
        >
          <span>{symbol}</span>
          <Search className="w-4 h-4 text-slate-400" />
        </button>

        {/* Big HUD Price */}
        <div className="flex items-baseline gap-2 min-w-0">
          <span className={`text-2xl sm:text-3xl font-black tracking-tight ${priceColor}`}>
            {displayPrice > 0 ? displayPrice.toFixed(2) : '--.--'}
          </span>

          {quote && (
            <span
              className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 shrink-0 ${badgeBg}`}
            >
              {isUp ? '+' : ''}
              {quote.change.toFixed(2)} ({isUp ? '+' : ''}
              {quote.changePct.toFixed(2)}%)
            </span>
          )}
        </div>
      </div>

      {/* Center: Essential Candle Stats (O / H / L / Vol) */}
      {!isNarrow && (
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-300">
          <div className="bg-car-black/60 px-2.5 py-1 rounded-lg border border-car-border/60">
            <span className="text-slate-500 mr-1">O</span>
            <span className="text-white">{openVal ? openVal.toFixed(2) : '-'}</span>
          </div>
          <div className="bg-car-black/60 px-2.5 py-1 rounded-lg border border-car-border/60">
            <span className="text-slate-500 mr-1">H</span>
            <span className="text-car-green">{highVal ? highVal.toFixed(2) : '-'}</span>
          </div>
          <div className="bg-car-black/60 px-2.5 py-1 rounded-lg border border-car-border/60">
            <span className="text-slate-500 mr-1">L</span>
            <span className="text-car-red">{lowVal ? lowVal.toFixed(2) : '-'}</span>
          </div>
          <div className="bg-car-black/60 px-2.5 py-1 rounded-lg border border-car-border/60">
            <span className="text-slate-500 mr-1">VOL</span>
            <span className="text-car-yellow">{volVal ? formatVol(volVal) : '-'}</span>
          </div>
        </div>
      )}

      {/* Right: Quick Cockpit Actions (Auto-Play, Refresh, Fullscreen) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Auto Play Carousel Toggle */}
        <button
          onClick={onToggleAutoPlay}
          title={isAutoPlay ? 'Tạm dừng tự động chuyển mã' : 'Bật tự động lướt mã (10s)'}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
            isAutoPlay
              ? 'bg-amber-500/20 text-car-yellow border-amber-500/50 animate-pulse'
              : 'bg-car-card-hover text-slate-300 border-car-border hover:bg-slate-700/50'
          }`}
        >
          {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="hidden sm:inline">{isAutoPlay ? 'TỰ CHUYỂN' : 'TỰ CHUYỂN'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Làm mới dữ liệu nến"
          disabled={isRefreshing}
          className="p-2 sm:px-2.5 bg-car-card-hover hover:bg-slate-700 text-slate-300 border border-car-border rounded-xl active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-car-cyan' : ''}`} />
        </button>

        {/* Live DNSE badge */}
        <div className="hidden xs:flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-car-black/50 px-2.5 py-1 rounded-lg border border-car-border">
          <span className="w-2 h-2 rounded-full bg-car-green animate-ping" />
          <span>DNSE OTR</span>
        </div>
      </div>
    </header>
  );
};
