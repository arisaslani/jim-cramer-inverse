'use client';

import { useEffect, useState } from 'react';

export default function CramerRecommendations({ symbol }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // In a production environment, this would be an API call
        // For now, we'll load the JSON file directly
        const response = await fetch(`/api/stock/${symbol.toLowerCase()}`);
        
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Daten für ${symbol}`);
        }
        
        const data = await response.json();
        setRecommendations(data.cramer_recommendations || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Keine Empfehlungen von Jim Cramer für {symbol} gefunden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empfehlung
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance nach 1M
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recommendations.map((rec, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(rec.date).toLocaleDateString('de-DE')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  rec.recommendation === 'buy' 
                    ? 'bg-green-100 text-green-800' 
                    : rec.recommendation === 'sell'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {rec.recommendation === 'buy' 
                    ? 'Kaufen' 
                    : rec.recommendation === 'sell'
                      ? 'Verkaufen'
                      : rec.recommendation}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={rec.performance && rec.performance['1m'] > 0 ? 'text-green-600' : 'text-red-600'}>
                  {rec.performance && rec.performance['1m'] 
                    ? `${rec.performance['1m'].toFixed(2)}%` 
                    : 'Keine Daten'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
