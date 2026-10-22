import { Candle } from '../types';

export interface IndicatorPoint {
  time: number;
  value: number;
  color?: string;
}

export function calculateEMA(candles: Candle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];

  const k = 2 / (period + 1);
  const result: IndicatorPoint[] = [];

  // Initial SMA for the first 'period' values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let currentEma = sum / period;
  result.push({ time: candles[period - 1].time, value: Number(currentEma.toFixed(2)) });

  for (let i = period; i < candles.length; i++) {
    currentEma = (candles[i].close - currentEma) * k + currentEma;
    result.push({ time: candles[i].time, value: Number(currentEma.toFixed(2)) });
  }

  return result;
}

export interface SuperTrendPoint {
  time: number;
  value: number;
  direction: 1 | -1; // 1: Bullish (Green), -1: Bearish (Red)
  color: string;
}

export function calculateSuperTrend(
  candles: Candle[],
  period: number = 10,
  multiplier: number = 3.0
): SuperTrendPoint[] {
  if (candles.length < period + 1) return [];

  // Step 1: True Range (TR)
  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hpc = Math.abs(candles[i].high - candles[i - 1].close);
    const lpc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hpc, lpc));
  }

  // Step 2: ATR (Wilder's Smoothing)
  const atr: number[] = [];
  let atrSum = 0;
  for (let i = 0; i < period; i++) {
    atrSum += tr[i];
  }
  let prevAtr = atrSum / period;
  for (let i = 0; i < period - 1; i++) {
    atr.push(0);
  }
  atr.push(prevAtr);

  for (let i = period; i < candles.length; i++) {
    prevAtr = (prevAtr * (period - 1) + tr[i]) / period;
    atr.push(prevAtr);
  }

  // Step 3: SuperTrend calculation
  const result: SuperTrendPoint[] = [];
  let finalUpper = 0;
  let finalLower = 0;
  let prevSuperTrend = 0;
  let direction: 1 | -1 = 1;

  for (let i = period; i < candles.length; i++) {
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const curAtr = atr[i];

    let basicUpper = hl2 + multiplier * curAtr;
    let basicLower = hl2 - multiplier * curAtr;

    if (i === period) {
      finalUpper = basicUpper;
      finalLower = basicLower;
      direction = candles[i].close > finalUpper ? 1 : -1;
      prevSuperTrend = direction === 1 ? finalLower : finalUpper;
    } else {
      const prevClose = candles[i - 1].close;

      if (basicLower > finalLower || prevClose < finalLower) {
        finalLower = basicLower;
      }

      if (basicUpper < finalUpper || prevClose > finalUpper) {
        finalUpper = basicUpper;
      }

      if (direction === 1) {
        if (candles[i].close < finalLower) {
          direction = -1;
          prevSuperTrend = finalUpper;
        } else {
          prevSuperTrend = finalLower;
        }
      } else {
        if (candles[i].close > finalUpper) {
          direction = 1;
          prevSuperTrend = finalLower;
        } else {
          prevSuperTrend = finalUpper;
        }
      }
    }

    result.push({
      time: candles[i].time,
      value: Number(prevSuperTrend.toFixed(2)),
      direction,
      color: direction === 1 ? '#00e676' : '#ff1744'
    });
  }

  return result;
}
