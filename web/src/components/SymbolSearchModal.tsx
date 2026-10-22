import React, { useState } from 'react';
import { X, Search, Star, Check } from 'lucide-react';
import { SECTOR_WATCHLISTS } from '../services/dnseApi';
import { Quote } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  activeSymbol: string;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
  quotesMap: Record<string, Quote>;
}

export const SymbolSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  activeSymbol,
  favorites,
  onToggleFavorite,
  quotesMap,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Collect all unique symbols across sectors
  const allSymbolsSet = new Set<string>();
  SECTOR_WATCHLISTS.forEach((sec) => sec.symbols.forEach((s) => allSymbolsSet.add(s)));
  favorites.forEach((s) => allSymbolsSet.add(s));
  const allSymbolsList = Array.from(allSymbolsSet).sort();

  const filteredSymbols = (activeTab === 'favorites' ? favorites : allSymbolsList).filter(
    (sym) =>
      sym.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in duration-200">
      <div className="bg-car-card border border-car-border w-full max-w-lg rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-car-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã (VD: SSI, HPG, FPT)..."
              autoFocus
              className="w-full bg-car-black border border-car-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-car-cyan text-base"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-car-card-hover text-slate-400 hover:text-white border border-car-border active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 px-3 py-2 bg-car-black/40 border-b border-car-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-car-blue text-white'
                : 'text-slate-400 hover:bg-car-card'
            }`}
          >
            Tất cả ({allSymbolsList.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'favorites'
                ? 'bg-amber-500/20 text-car-yellow border border-amber-500/50'
                : 'text-slate-400 hover:bg-car-card'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-car-yellow text-car-yellow" />
            <span>Yêu thích ({favorites.length})</span>
          </button>
        </div>

        {/* Symbol List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-car-border/30">
          {filteredSymbols.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Không tìm thấy mã phù hợp
            </div>
          ) : (
            filteredSymbols.map((sym) => {
              const q = quotesMap[sym];
              const isFav = favorites.includes(sym);
              const isActive = activeSymbol === sym;
              const isUp = (q?.change ?? 0) >= 0;
              const priceColor = isUp ? 'text-car-green' : 'text-car-red';

              return (
                <div
                  key={sym}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-car-card-hover border border-car-cyan/40'
                      : 'hover:bg-car-black/60'
                  }`}
                  onClick={() => {
                    onSelectSymbol(sym);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg text-white tracking-wide w-14">
                      {sym}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold bg-cyan-950 text-car-cyan px-2 py-0.5 rounded border border-cyan-500/30">
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {q ? (
                      <div className="text-right">
                        <div className={`font-black text-sm ${priceColor}`}>
                          {q.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            isUp ? 'text-car-green' : 'text-car-red'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {q.changePct.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">--</span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(sym);
                      }}
                      className="p-2 rounded-lg text-slate-500 hover:text-car-yellow hover:bg-car-card active:scale-90"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          isFav ? 'fill-car-yellow text-car-yellow' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
