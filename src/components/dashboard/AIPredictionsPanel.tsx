import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  Leaf,
  Loader2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface HighDemandItem {
  name: string;
  reason: string;
  confidenceScore: number;
}

interface LowDemandItem {
  name: string;
  reason: string;
  recommendation: string;
}

interface PeakTime {
  time: string;
  expectedOrders: string;
}

interface Predictions {
  highDemandItems: HighDemandItem[];
  lowDemandItems: LowDemandItem[];
  peakTimes: PeakTime[];
  wastageReduction: string[];
  summary: string;
}

interface RawData {
  totalOrders: number;
  topItems: { name: string; count: number; revenue: number }[];
  peakHours: string[];
  busiestDays: string[];
}

interface AIPredictionsPanelProps {
  predictions: Predictions | null;
  rawData: RawData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const AIPredictionsPanel: React.FC<AIPredictionsPanelProps> = ({
  predictions,
  rawData,
  loading,
  error,
  onRefresh,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Demand Predictions</h2>
            <p className="text-sm text-muted-foreground">Powered by Lovable AI</p>
          </div>
        </div>
        <Button onClick={onRefresh} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? 'Analyzing...' : 'Get Predictions'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!predictions && !loading && !error && (
        <div className="rounded-xl bg-card border-2 border-dashed p-12 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Predictions Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click "Get Predictions" to analyze your order data with AI
          </p>
        </div>
      )}

      {predictions && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* High Demand Items */}
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-semibold">High Demand Forecast</h3>
            </div>
            <div className="space-y-4">
              {predictions.highDemandItems?.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="success">{item.confidenceScore}% confidence</Badge>
                  </div>
                  <Progress value={item.confidenceScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Low Demand / Wastage Risk */}
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">Low Demand Alert</h3>
            </div>
            <div className="space-y-3">
              {predictions.lowDemandItems?.length > 0 ? (
                predictions.lowDemandItems.map((item, idx) => (
                  <div key={idx} className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="warning">Low Demand</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{item.reason}</p>
                    <p className="text-xs text-warning font-medium">💡 {item.recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All items showing healthy demand
                </p>
              )}
            </div>
          </div>

          {/* Peak Times */}
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-info" />
              <h3 className="font-semibold">Peak Time Predictions</h3>
            </div>
            <div className="space-y-3">
              {predictions.peakTimes?.map((peak, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-info/10 border border-info/20 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-info" />
                    </div>
                    <span className="font-medium">{peak.time}</span>
                  </div>
                  <Badge variant="info">{peak.expectedOrders}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Wastage Reduction Tips */}
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Wastage Reduction Tips</h3>
            </div>
            <ul className="space-y-2">
              {predictions.wastageReduction?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-success">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Summary */}
      {predictions?.summary && (
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Summary</h3>
          </div>
          <p className="text-sm leading-relaxed">{predictions.summary}</p>
        </div>
      )}

      {/* Raw Stats */}
      {rawData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{rawData.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Orders Analyzed</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-success">{rawData.topItems?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Items Tracked</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-info">{rawData.peakHours?.[0] || '--'}</p>
            <p className="text-xs text-muted-foreground">Peak Hour</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-warning">{rawData.busiestDays?.[0] || '--'}</p>
            <p className="text-xs text-muted-foreground">Busiest Day</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionsPanel;
