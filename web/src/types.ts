export type Timeframe = '1' | '5' | '15' | '1H' | '1D';

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time?: number;
  refPrice?: number;
  ceilingPrice?: number;
  floorPrice?: number;
}

export interface IndicatorConfig {
  superTrend: boolean;
  ema20: boolean;
  ema50: boolean;
  volume: boolean;
}

export interface SectorWatchlist {
  id: string;
  name: string;
  symbols: string[];
}
