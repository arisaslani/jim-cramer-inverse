'use client';

import { useEffect } from 'react';

export default function ChartJsSetup() {
  useEffect(() => {
    // This component ensures Chart.js plugins are loaded
    // It doesn't render anything visible
    
    // In a real implementation, we would import and register Chart.js plugins here
    console.log('ChartJsSetup component mounted');
  }, []);
  
  return null;
}
