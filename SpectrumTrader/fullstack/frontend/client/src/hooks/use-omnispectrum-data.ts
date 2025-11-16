import { useCallback } from "react";
import useSWR from "swr";
import type { OmniSpectrumData } from "@shared/schema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook for fetching and managing omnispectrum data
 * Includes refresh capability for backend inference
 */
export function useOmnispectrumData() {
  const { data, error, isLoading, mutate } = useSWR<OmniSpectrumData>(
    '/api/omnispectrum',
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000, // Auto-refresh every 30 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60 * 1000, // Dedupe requests within 60 seconds
    }
  );

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch('/api/omnispectrum/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        // Update the SWR cache with new data
        mutate(result.data, false);
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [mutate]);

  return {
    data,
    error,
    isLoading,
    refreshData,
    mutate,
  };
}
