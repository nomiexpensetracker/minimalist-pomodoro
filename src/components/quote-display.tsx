import { useEffect, useState } from 'react';

interface Quote {
  q: string;
  a: string;
}

interface QuoteDisplayProps {
  dark: boolean;
}

const QuoteDisplay = ({ dark }: QuoteDisplayProps) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quote');
        if (!response.ok) throw new Error('Failed to fetch quote');
        const data = await response.json();
        setQuote(data[0]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading || error || !quote) return null;

  return (
    <h4 className={`text-xs tracking-widest uppercase font-medium ${dark ? 'text-forest-600' : 'text-forest-400'}`}>
      {quote.q} - {quote.a}
    </h4>
  );
};

export default QuoteDisplay;