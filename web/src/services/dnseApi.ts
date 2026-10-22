import { Candle, Quote, Timeframe } from '../types';

export const SECTOR_WATCHLISTS = [
  {
    id: 'vn30',
    name: 'VN30',
    symbols: ['FPT', 'HPG', 'TCB', 'MBB', 'VPB', 'SSI', 'MWG', 'VHM', 'VIC', 'MSN', 'VNM', 'ACB', 'BID', 'CTG', 'STB', 'HDB', 'TPB', 'VIB', 'GAS', 'PLX', 'POW', 'SAB', 'VJC', 'VRE']
  },
  {
    id: 'banking',
    name: 'Ngân Hàng',
    symbols: ['TCB', 'MBB', 'VPB', 'VCB', 'ACB', 'CTG', 'BID', 'STB', 'HDB', 'TPB', 'LPB', 'SHB', 'VIB', 'MSB', 'OCB']
  },
  {
    id: 'securities',
    name: 'Chứng Khoán',
    symbols: ['SSI', 'VND', 'VCI', 'HCM', 'MBS', 'SHS', 'FTS', 'BSI', 'CTS', 'AGR', 'VIX']
  },
  {
    id: 'steel',
    name: 'Thép & VL',
    symbols: ['HPG', 'HSG', 'NKG', 'VGS', 'KHB', 'HT1']
  },
  {
    id: 'realestate',
    name: 'Bất Động Sản',
    symbols: ['VHM', 'VIC', 'NVL', 'DIG', 'PDR', 'DXG', 'KDH', 'NLG', 'CEO', 'KBC', 'SZC']
  },
  {
    id: 'tech_retail',
    name: 'Công Nghệ & BL',
    symbols: ['FPT', 'MWG', 'DGW', 'FRT', 'PNJ', 'ELC', 'CMG']
  }
];

export function getResolutionTimeRange(resolution: Timeframe): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  let daysBack = 365;

  switch (resolution) {
    case '1':
      daysBack = 4;
      break;
    case '5':
      daysBack = 15;
      break;
    case '15':
      daysBack = 45;
      break;
    case '1H':
      daysBack = 120;
      break;
    case '1D':
      daysBack = 400;
      break;
  }

  return {
    from: now - daysBack * 86400,
    to: now + 3600
  };
}

export async function fetchDnseCandles(
  symbol: string,
  resolution: Timeframe
): Promise<Candle[]> {
  const { from, to } = getResolutionTimeRange(resolution);
  const url = `https://api.dnse.com.vn/chart-api/v2/ohlcs/stock?from=${from}&to=${to}&symbol=${symbol.toUpperCase()}&resolution=${resolution}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.t || !Array.isArray(data.t) || data.t.length === 0) {
      return [];
    }

    const candles: Candle[] = [];
    const len = data.t.length;
    for (let i = 0; i < len; i++) {
      candles.push({
        time: data.t[i],
        open: Number(data.o[i]),
        high: Number(data.h[i]),
        low: Number(data.l[i]),
        close: Number(data.c[i]),
        volume: Number(data.v[i] || 0)
      });
    }

    // Sort by time ascending
    candles.sort((a, b) => a.time - b.time);
    return candles;
  } catch (error) {
    console.error(`Error fetching DNSE candles for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchDnseQuote(symbol: string): Promise<Quote | null> {
  try {
    // We fetch recent 1D candles to get accurate close & previous close for % calculation
    const now = Math.floor(Date.now() / 1000);
    const from = now - 10 * 86400;
    const url = `https://api.dnse.com.vn/chart-api/v2/ohlcs/stock?from=${from}&to=${now + 3600}&symbol=${symbol.toUpperCase()}&resolution=1D`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data || !data.t || data.t.length === 0) return null;

    const count = data.t.length;
    const lastIdx = count - 1;
    const prevIdx = Math.max(0, lastIdx - 1);

    const price = Number(data.c[lastIdx]);
    const refPrice = count > 1 ? Number(data.c[prevIdx]) : price;
    const change = Number((price - refPrice).toFixed(2));
    const changePct = refPrice > 0 ? Number(((change / refPrice) * 100).toFixed(2)) : 0;

    return {
      symbol: symbol.toUpperCase(),
      price,
      change,
      changePct,
      open: Number(data.o[lastIdx]),
      high: Number(data.h[lastIdx]),
      low: Number(data.l[lastIdx]),
      close: price,
      volume: Number(data.v[lastIdx] || 0),
      refPrice,
      ceilingPrice: Number((refPrice * 1.07).toFixed(2)),
      floorPrice: Number((refPrice * 0.93).toFixed(2)),
      time: data.t[lastIdx]
    };
  } catch (e) {
    console.warn(`Failed to fetch quote for ${symbol}:`, e);
    return null;
  }
}
