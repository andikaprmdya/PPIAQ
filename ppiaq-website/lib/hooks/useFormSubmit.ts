import { useState } from 'react';
import { API_ENDPOINTS } from '@/lib/constants';

interface SubmitOptions {
  endpoint: string;
  data: Record<string, any>;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export function useFormSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (options: SubmitOptions) => {
    const { endpoint, data, onSuccess, onError } = options;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      const result = await response.json();
      setSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, success };
}
