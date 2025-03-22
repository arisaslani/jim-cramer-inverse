import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [stockSymbol, setStockSymbol] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!stockSymbol) {
      setError('Bitte geben Sie ein Aktien-Symbol ein');
      return;
    }
    
    // Redirect to the stock analysis page
    window.location.href = `/stock/${stockSymbol.toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Inverse Cramer Tracker</h1>
          <p className="text-xl text-gray-600">
            Überprüfen Sie, ob die "Inverse Cramer"-Theorie funktioniert
          </p>
        </header>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Geben Sie ein Aktien-Symbol ein
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="stockSymbol" className="block text-sm font-medium text-gray-700 mb-1">
                Aktien-Symbol (z.B. TSLA, AAPL)
              </label>
              <input
                type="text"
                id="stockSymbol"
                value={stockSymbol}
                onChange={(e) => {
                  setStockSymbol(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="TSLA"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Analysieren
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">Beliebte Aktien:</h3>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'TSLA', 'AMZN', 'NVDA', 'NFLX'].map((symbol) => (
                <Link 
                  key={symbol}
                  href={`/stock/${symbol}`}
                  className="inline-block px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm"
                >
                  {symbol}
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Was ist die "Inverse Cramer"-Theorie?</h2>
          <p className="mb-4">
            Die "Inverse Cramer"-Theorie besagt, dass Anleger besser abschneiden könnten, wenn sie das Gegenteil 
            von dem tun, was Jim Cramer, der Moderator von CNBC's "Mad Money", empfiehlt.
          </p>
          <p className="mb-4">
            Jim Cramer ist bekannt für seine energischen und oft kontroversen Aktienempfehlungen. 
            Diese Website ermöglicht es Ihnen, seine Empfehlungen für bestimmte Aktien zu sehen und 
            zu analysieren, wie sich die Aktien nach seinen Empfehlungen entwickelt haben.
          </p>
          <p>
            Geben Sie einfach ein Aktien-Symbol ein, um zu sehen, was Jim Cramer dazu gesagt hat und 
            wie sich die Aktie seitdem entwickelt hat.
          </p>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Inverse Cramer Tracker - Nur zu Bildungszwecken</p>
        </div>
      </footer>
    </div>
  );
}
