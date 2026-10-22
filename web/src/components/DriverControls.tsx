import React from 'react';
import { Timeframe, IndicatorConfig } from '../types';
import { Star, BarChart3, TrendingUp, Activity } from 'lucide-react';

interface Props {
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  indicators: IndicatorConfig;
  onToggleIndicator: (key: keyof IndicatorConfig) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isNarrow?: boolean;
}

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: '1', label: '1M' },
  { id: '5', label: '5M' },
  { id: '15', label: '15M' },
  { id: '1H', label: '1H' },
  { id: '1D', label: '1D' },
];

export const DriverControls: React.FC<Props> = ({
  timeframe,
  onSelectTimeframe,
  indicators,
  onToggleIndicator,
  isFavorite,
  onToggleFavorite,
  isNarrow = false,
}) => {
  return (
    <footer className="bg-car-card border-t border-car-border px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none shadow-xl">
      {/* Left: Timeframe Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {TIMEFRAMES.map((tf) => {
          const isActive = timeframe === tf.id;
          return (
            <button
              key={tf.id}
              onClick={() => onSelectTimeframe(tf.id)}
              className={`min-w-[48px] sm:min-w-[54px] h-[40px] sm:h-[44px] rounded-xl font-black text-xs sm:text-sm border transition-all active:scale-95 flex items-center justify-center ${
                isActive
                  ? 'bg-car-blue text-white border-blue-400 shadow-[0_0_12px_rgba(41,121,255,0.4)]'
                  : 'bg-car-black/80 text-slate-400 border-car-border hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf.label}
            </button>
          );
        })}
      </div>

      {/* Right: Indicator toggles & Favorite */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* SuperTrend Toggle */}
        <button
          onClick={() => onToggleIndicator('superTrend')}
          className={`h-[40px] sm:h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1 ${
            indicators.superTrend
              ? 'bg-purple-950/80 text-car-purple border-purple-500/50 shadow-sm'
              : 'bg-car-black/60 text-slate-500 border-car-border hover:text-slate-300'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>ST</span>
        </button>

        {/* EMA Toggle */}
        <button
          onClick={() => {
            onToggleIndicator('ema20');
            onToggleIndicator('ema50');
          }}
          className={`h-[40px] sm:h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1 ${
            indicators.ema20 || indicators.ema50
              ? 'bg-cyan-950/80 text-car-cyan border-cyan-500/50 shadow-sm'
              : 'bg-car-black/60 text-slate-500 border-car-border hover:text-slate-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>EMA</span>
        </button>

        {/* Volume Toggle */}
        <button
          onClick={() => onToggleIndicator('volume')}
          className={`h-[40px] sm:h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1 ${
            indicators.volume
              ? 'bg-amber-950/80 text-car-yellow border-amber-500/50 shadow-sm'
              : 'bg-car-black/60 text-slate-500 border-car-border hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">VOL</span>
        </button>

        {/* Favorite Toggle */}
        <button
          onClick={onToggleFavorite}
          title={isFavorite ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
          className={`h-[40px] sm:h-[44px] px-3 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
            isFavorite
              ? 'bg-amber-500/20 text-car-yellow border-amber-500/50'
              : 'bg-car-black/60 text-slate-500 border-car-border hover:text-slate-300'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-car-yellow' : ''}`} />
        </button>
      </div>
    </footer>
  );
};
