'use client';
import { useEffect, useState } from 'react';

export default function TestRollbarPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/test-rollbar');
      if (!res.ok) {
        const { error } = await res.json();
        setError(error);
      }
    };

    fetchData();
  }, []);

  if (error) {
    throw new Error(error);
  }

  return <div>Loading...</div>;
}
