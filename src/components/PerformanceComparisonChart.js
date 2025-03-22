'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PerformanceComparisonChart({ symbol }) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  // Prepare data for bar chart
  const chartData = {
    labels: ['1 Tag', '1 Woche', '1 Monat', '1 Jahr'],
    datasets: [
      {
        label: 'Nach "Kaufen"-Empfehlungen',
        data: [
          avgBuyPerformance['1d'] || 0,
          avgBuyPerformance['1w'] || 0,
          avgBuyPerformance['1m'] || 0,
          avgBuyPerformance['1y'] || 0
        ],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'Nach "Verkaufen"-Empfehlungen',
        data: [
          avgSellPerformance['1d'] || 0,
          avgSellPerformance['1w'] || 0,
          avgSellPerformance['1m'] || 0,
          avgSellPerformance['1y'] || 0
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Durchschnittliche Performance (%)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance nach Cramers Empfehlungen'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
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
