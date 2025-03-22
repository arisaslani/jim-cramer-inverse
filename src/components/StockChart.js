'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { de } from 'date-fns/locale';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function StockChart({ symbol }) {
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <p>Bitte versuchen Sie es später erneut oder wählen Sie ein anderes Aktien-Symbol.</p>
      </div>
    );
  }

  // For demo purposes, we'll use mock data if the API call fails
  const mockData = {
    labels: Array.from({ length: 60 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (60 - i));
      return date.toISOString().split('T')[0];
    }),
    datasets: [
      {
        label: symbol,
        data: Array.from({ length: 60 }, (_, i) => 100 + Math.random() * 100 * Math.sin(i / 10)),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  };

  // Prepare chart data from stock data or use mock data
  const chartData = stockData ? {
    labels: stockData.stock_data.prices.map(price => price.date),
    datasets: [
      {
        label: stockData.stock_data.meta.company_name || symbol,
        data: stockData.stock_data.prices.map(price => price.close),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  } : mockData;

  // Add annotations for Cramer's recommendations
  const annotations = {};
  
  if (stockData && stockData.cramer_recommendations) {
    stockData.cramer_recommendations.forEach((rec, index) => {
      const matchingPrice = stockData.stock_data.prices.find(price => 
        price.date.substring(0, 10) === rec.date.substring(0, 10)
      );
      
      if (matchingPrice) {
        annotations[`cramer-${index}`] = {
          type: 'line',
          scaleID: 'x',
          value: matchingPrice.date,
          borderColor: rec.recommendation === 'buy' ? 'green' : 'red',
          borderWidth: 2,
          label: {
            content: `${rec.recommendation.toUpperCase()} ${rec.date.substring(0, 10)}`,
            enabled: true,
            position: 'top',
            backgroundColor: rec.recommendation === 'buy' ? 'rgba(0, 128, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)',
          }
        };
      }
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          tooltipFormat: 'dd.MM.yyyy',
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        adapters: {
          date: {
            locale: de
          }
        },
        title: {
          display: true,
          text: 'Datum'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Preis ($)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${symbol} Aktienkurs mit Jim Cramer Empfehlungen`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      },
      annotation: {
        annotations: annotations
      }
    }
  };

  return (
    <div className="h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
