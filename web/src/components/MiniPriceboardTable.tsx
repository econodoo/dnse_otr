import React from 'react';
import { Quote } from '../types';

interface Props {
  symbols: string[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  quotesMap: Record<string, Quote>;
}

export const MiniPriceboardTable: React.FC<Props> = ({
  symbols,
  activeSymbol,
  onSelectSymbol,
  quotesMap,
}) => {
  const formatVol = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v ? v.toString() : '-';
  };

  return (
    <div className="flex-1 min-h-[140px] max-h-[35vh] overflow-y-auto bg-car-black border-t border-car-border select-none">
      <table className="w-full text-left text-xs">
        <thead className="bg-car-card/90 text-slate-400 sticky top-0 border-b border-car-border/60 z-10 font-bold">
          <tr>
            <th className="py-1.5 px-3">Mã</th>
            <th className="py-1.5 px-2 text-right">Khớp</th>
            <th className="py-1.5 px-2 text-right">+/-</th>
            <th className="py-1.5 px-2 text-right">%</th>
            <th className="py-1.5 px-3 text-right">KL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-car-border/20 font-semibold">
          {symbols.map((sym) => {
            const q = quotesMap[sym];
            const isActive = activeSymbol === sym;
            const isUp = (q?.change ?? 0) >= 0;
            const priceColor = isUp ? 'text-car-green' : 'text-car-red';

            return (
              <tr
                key={sym}
                onClick={() => onSelectSymbol(sym)}
                className={`cursor-pointer transition-colors active:bg-slate-800 ${
                  isActive
                    ? 'bg-car-card-hover border-l-4 border-car-cyan font-black'
                    : 'hover:bg-car-card/60'
                }`}
              >
                <td className="py-2 px-3 text-white font-extrabold flex items-center gap-1.5">
                  <span>{sym}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-car-cyan animate-pulse" />
                  )}
                </td>
                <td className={`py-2 px-2 text-right font-black ${priceColor}`}>
                  {q?.price ? q.price.toFixed(2) : '--.--'}
                </td>
                <td className={`py-2 px-2 text-right ${priceColor}`}>
                  {q ? `${isUp ? '+' : ''}${q.change.toFixed(2)}` : '-'}
                </td>
                <td className={`py-2 px-2 text-right font-bold ${priceColor}`}>
                  {q ? `${isUp ? '+' : ''}${q.changePct.toFixed(2)}%` : '-'}
                </td>
                <td className="py-2 px-3 text-right text-slate-400 font-mono">
                  {q?.volume ? formatVol(q.volume) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
