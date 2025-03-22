import { notFound } from 'next/navigation';
import StockChart from '../../../components/StockChart';
import CramerRecommendations from '../../../components/CramerRecommendations';
import PerformanceAnalysis from '../../../components/PerformanceAnalysis';
import PerformanceComparisonChart from '../../../components/PerformanceComparisonChart';
import ChartJsSetup from '../../../components/ChartJsSetup';
import Link from 'next/link';

// This is a dynamic route that will be generated for each stock symbol
export default function StockPage({ params }) {
  const { symbol } = params;
  
  // In a real implementation, we would fetch this data server-side
  // For now, we'll import it directly in the client component
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              &larr; Zurück zur Startseite
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-blue-800 mt-4">{symbol} - Inverse Cramer Analyse</h1>
        </header>

        <ChartJsSetup />
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <StockChart symbol={symbol} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Jim Cramers Empfehlungen</h2>
            <CramerRecommendations symbol={symbol} />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Performance-Analyse</h2>
            <PerformanceAnalysis symbol={symbol} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance-Vergleich</h2>
          <PerformanceComparisonChart symbol={symbol} />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Über die "Inverse Cramer"-Theorie</h2>
          <p className="mb-4">
            Die "Inverse Cramer"-Theorie ist eine humorvolle Anlagestrategie, die darauf basiert, das Gegenteil 
            von Jim Cramers Empfehlungen zu tun. Jim Cramer ist der Moderator der CNBC-Sendung "Mad Money" und 
            bekannt für seine energischen Aktienempfehlungen.
          </p>
          <p className="mb-4">
            Diese Theorie entstand, weil einige Anleger beobachtet haben, dass Aktien manchmal das Gegenteil 
            von dem tun, was Cramer vorhergesagt hat. Es ist wichtig zu beachten, dass dies keine wissenschaftlich 
            fundierte Anlagestrategie ist und nur zu Bildungszwecken dient.
          </p>
          <p>
            Diese Analyse zeigt Ihnen, was mit der Aktie nach Cramers Empfehlungen passiert ist, und lässt Sie 
            selbst entscheiden, ob die "Inverse Cramer"-Theorie in diesem Fall funktioniert hat.
          </p>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Inverse Cramer Tracker - Nur zu Bildungszwecken</p>
        </div>
      </footer>
    </div>
  );
}
