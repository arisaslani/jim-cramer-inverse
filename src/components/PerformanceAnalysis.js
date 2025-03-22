'use client';

import { useEffect, useState } from 'react';

export default function PerformanceAnalysis({ symbol }) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        // In a production environment, this would be an API call
        // For now, we'll load the JSON file directly
        const response = await fetch(`/api/stock/${symbol.toLowerCase()}`);
        
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Daten für ${symbol}`);
        }
        
        const data = await response.json();
        setStockData(data);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
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

  if (!stockData || !stockData.cramer_recommendations || stockData.cramer_recommendations.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Keine Daten für die Performance-Analyse verfügbar.</p>
      </div>
    );
  }

  // Calculate average performance after Cramer's recommendations
  const buyRecommendations = stockData.cramer_recommendations.filter(rec => rec.recommendation === 'buy');
  const sellRecommendations = stockData.cramer_recommendations.filter(rec => rec.recommendation === 'sell');
  
  const avgBuyPerformance = {
    '1d': calculateAverage(buyRecommendations, '1d'),
    '1w': calculateAverage(buyRecommendations, '1w'),
    '1m': calculateAverage(buyRecommendations, '1m'),
    '1y': calculateAverage(buyRecommendations, '1y')
  };
  
  const avgSellPerformance = {
    '1d': calculateAverage(sellRecommendations, '1d'),
    '1w': calculateAverage(sellRecommendations, '1w'),
    '1m': calculateAverage(sellRecommendations, '1m'),
    '1y': calculateAverage(sellRecommendations, '1y')
  };

  // Determine if "Inverse Cramer" would have worked
  const inverseCramerWorks = determineInverseCramerEffectiveness(avgBuyPerformance, avgSellPerformance);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Inverse Cramer Analyse</h3>
        <div className={`p-4 rounded-lg ${inverseCramerWorks ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-medium">
            {inverseCramerWorks 
              ? 'Die "Inverse Cramer"-Theorie scheint für diese Aktie zu funktionieren!' 
              : 'Die "Inverse Cramer"-Theorie scheint für diese Aktie nicht zu funktionieren.'}
          </p>
          <p className="text-sm mt-1">
            {inverseCramerWorks 
              ? 'Cramers Empfehlungen haben im Durchschnitt zu gegenteiligen Ergebnissen geführt.' 
              : 'Cramers Empfehlungen waren im Durchschnitt korrekt.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-md font-medium mb-2">Nach "Kaufen"-Empfehlungen</h3>
          {buyRecommendations.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Zeitraum</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Durchschn. Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Tag</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgBuyPerformance['1d'] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgBuyPerformance['1d'] ? `${avgBuyPerformance['1d'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Woche</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgBuyPerformance['1w'] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgBuyPerformance['1w'] ? `${avgBuyPerformance['1w'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Monat</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgBuyPerformance['1m'] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgBuyPerformance['1m'] ? `${avgBuyPerformance['1m'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Jahr</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgBuyPerformance['1y'] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgBuyPerformance['1y'] ? `${avgBuyPerformance['1y'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">Keine "Kaufen"-Empfehlungen verfügbar.</p>
          )}
        </div>

        <div>
          <h3 className="text-md font-medium mb-2">Nach "Verkaufen"-Empfehlungen</h3>
          {sellRecommendations.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Zeitraum</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Durchschn. Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Tag</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgSellPerformance['1d'] < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgSellPerformance['1d'] ? `${avgSellPerformance['1d'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Woche</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgSellPerformance['1w'] < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgSellPerformance['1w'] ? `${avgSellPerformance['1w'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Monat</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgSellPerformance['1m'] < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgSellPerformance['1m'] ? `${avgSellPerformance['1m'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1 Jahr</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${avgSellPerformance['1y'] < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgSellPerformance['1y'] ? `${avgSellPerformance['1y'].toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">Keine "Verkaufen"-Empfehlungen verfügbar.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate average performance
function calculateAverage(recommendations, timeframe) {
  if (!recommendations || recommendations.length === 0) return null;
  
  const validRecommendations = recommendations.filter(rec => 
    rec.performance && rec.performance[timeframe] !== undefined && rec.performance[timeframe] !== null
  );
  
  if (validRecommendations.length === 0) return null;
  
  const sum = validRecommendations.reduce((total, rec) => total + rec.performance[timeframe], 0);
  return sum / validRecommendations.length;
}

// Helper function to determine if "Inverse Cramer" would have worked
function determineInverseCramerEffectiveness(buyPerf, sellPerf) {
  // For "Inverse Cramer" to work:
  // 1. Buy recommendations should lead to negative returns (or at least underperform)
  // 2. Sell recommendations should lead to positive returns (or at least outperform)
  
  // We'll focus on 1-month performance as a reasonable timeframe
  const buyMonthPerf = buyPerf['1m'];
  const sellMonthPerf = sellPerf['1m'];
  
  // If we don't have both types of recommendations, we can't fully evaluate
  if (buyMonthPerf === null && sellMonthPerf === null) return false;
  
  // If we only have buy recommendations
  if (buyMonthPerf !== null && sellMonthPerf === null) {
    return buyMonthPerf < 0; // Inverse works if buy recommendations led to losses
  }
  
  // If we only have sell recommendations
  if (buyMonthPerf === null && sellMonthPerf !== null) {
    return sellMonthPerf > 0; // Inverse works if sell recommendations led to gains
  }
  
  // If we have both types of recommendations
  // Inverse Cramer works if either:
  // - Buy recommendations led to losses AND sell recommendations led to gains
  // - Buy recommendations performed worse than sell recommendations
  return (buyMonthPerf < 0 && sellMonthPerf > 0) || (buyMonthPerf < sellMonthPerf);
}
