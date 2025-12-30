import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface AIPredictionResponse {
  predictions: Predictions;
  rawData: RawData;
}

export const useAIPredictions = () => {
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [rawData, setRawData] = useState<RawData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke<AIPredictionResponse>(
        'ai-demand-prediction'
      );

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data?.predictions) {
        setPredictions(data.predictions);
        setRawData(data.rawData);
        toast.success('AI predictions updated!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch predictions';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('AI rate limit reached. Please try again later.');
      } else if (message.includes('credits')) {
        toast.error('AI credits exhausted. Please add funds.');
      } else {
        toast.error('Failed to generate AI predictions');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    predictions,
    rawData,
    loading,
    error,
    fetchPredictions,
  };
};
