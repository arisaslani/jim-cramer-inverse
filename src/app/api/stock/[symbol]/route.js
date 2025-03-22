// API route to serve stock data with Cramer recommendations
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { symbol } = params;
  
  try {
    // Path to the JSON file with stock data and Cramer recommendations
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', `${symbol.toLowerCase()}_data.json`);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Keine Daten für ${symbol} gefunden` },
        { status: 404 }
      );
    }
    
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error serving data for ${symbol}:`, error);
    return NextResponse.json(
      { error: `Fehler beim Laden der Daten für ${symbol}` },
      { status: 500 }
    );
  }
}
