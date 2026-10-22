import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  CandlestickData,
  WhitespaceData,
  HistogramData,
  LineData,
  UTCTimestamp
} from 'lightweight-charts';
import { Candle, IndicatorConfig } from '../types';
import { calculateEMA, calculateSuperTrend } from '../utils/indicators';

interface Props {
  candles: Candle[];
  symbol: string;
  indicators: IndicatorConfig;
  onHoverCandle?: (candle: Candle | null) => void;
}

export const TradingViewChart: React.FC<Props> = ({
  candles,
  symbol,
  indicators,
  onHoverCandle
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const superTrendSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create lightweight-chart with car/tablet AMOLED dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0b0e' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(38, 44, 61, 0.4)' },
        horzLines: { color: 'rgba(38, 44, 61, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#475569',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#475569',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(38, 44, 61, 0.6)',
        scaleMargins: {
          top: 0.08,
          bottom: 0.22, // leaves room for volume histogram below
        },
      },
      timeScale: {
        borderColor: 'rgba(38, 44, 61, 0.6)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        minBarSpacing: 4,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Main Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00e676',
      downColor: '#ff1744',
      borderVisible: false,
      wickUpColor: '#00e676',
      wickDownColor: '#ff1744',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    candleSeriesRef.current = candleSeries;

    // Volume Series at bottom
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // EMA 20 (Cyan)
    const ema20Series = chart.addLineSeries({
      color: '#00e5ff',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });
    ema20SeriesRef.current = ema20Series;

    // EMA 50 (Orange)
    const ema50Series = chart.addLineSeries({
      color: '#ff9100',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });
    ema50SeriesRef.current = ema50Series;

    // SuperTrend (Gold/Accent)
    const superTrendSeries = chart.addLineSeries({
      color: '#e040fb',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });
    superTrendSeriesRef.current = superTrendSeries;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData || !onHoverCandle) {
        onHoverCandle?.(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as CandlestickData;
      if (data) {
        onHoverCandle({
          time: Number(data.time),
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: 0,
        });
      }
    });

    // Resize Observer for dynamic screen resizing (portrait, landscape, split-screen)
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update Data
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || candles.length === 0) return;

    // Format Candlestick Data
    const formattedCandles: CandlestickData[] = candles.map((c) => ({
      time: (c.time as unknown) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeriesRef.current.setData(formattedCandles);

    // Format Volume Data
    if (volumeSeriesRef.current) {
      if (indicators.volume) {
        const formattedVolumes: HistogramData[] = candles.map((c, idx) => {
          const isUp = idx === 0 ? c.close >= c.open : c.close >= candles[idx - 1].close;
          return {
            time: (c.time as unknown) as UTCTimestamp,
            value: c.volume,
            color: isUp ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 23, 68, 0.35)',
          };
        });
        volumeSeriesRef.current.setData(formattedVolumes);
        volumeSeriesRef.current.applyOptions({ visible: true });
      } else {
        volumeSeriesRef.current.applyOptions({ visible: false });
      }
    }

    // Format EMA 20
    if (ema20SeriesRef.current) {
      if (indicators.ema20) {
        const ema20Data = calculateEMA(candles, 20);
        ema20SeriesRef.current.setData(
          ema20Data.map((d) => ({
            time: (d.time as unknown) as UTCTimestamp,
            value: d.value,
          }))
        );
        ema20SeriesRef.current.applyOptions({ visible: true });
      } else {
        ema20SeriesRef.current.applyOptions({ visible: false });
      }
    }

    // Format EMA 50
    if (ema50SeriesRef.current) {
      if (indicators.ema50) {
        const ema50Data = calculateEMA(candles, 50);
        ema50SeriesRef.current.setData(
          ema50Data.map((d) => ({
            time: (d.time as unknown) as UTCTimestamp,
            value: d.value,
          }))
        );
        ema50SeriesRef.current.applyOptions({ visible: true });
      } else {
        ema50SeriesRef.current.applyOptions({ visible: false });
      }
    }

    // Format SuperTrend
    if (superTrendSeriesRef.current) {
      if (indicators.superTrend) {
        const stData = calculateSuperTrend(candles, 10, 3.0);
        superTrendSeriesRef.current.setData(
          stData.map((d) => ({
            time: (d.time as unknown) as UTCTimestamp,
            value: d.value,
          }))
        );
        superTrendSeriesRef.current.applyOptions({ visible: true });
      } else {
        superTrendSeriesRef.current.applyOptions({ visible: false });
      }
    }

    // Fit content smoothly
    chartRef.current.timeScale().fitContent();
  }, [candles, indicators, symbol]);

  return (
    <div className="relative w-full h-full min-h-[220px] bg-car-black overflow-hidden select-none">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};
