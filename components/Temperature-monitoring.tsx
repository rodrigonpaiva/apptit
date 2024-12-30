import React, { useState } from 'react';
import { Camera, ThermometerSnowflake, AlertTriangle, Check } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';

const TemperatureMonitoring = () => {
  const [scanMode, setScanMode] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleScan = () => {
    setScanMode(true);
    // Simulação de leitura
    setTimeout(() => {
      setTemperature(-18.5);
      setStatus('normal');
      setScanMode(false);
    }, 1500);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Monitoramento de Temperatura</h1>

      <Card className="mb-4">
        <CardContent className="p-6">
          <button
            onClick={handleScan}
            className="w-full h-32 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {scanMode ? (
              <div className="animate-pulse flex items-center">
                <ThermometerSnowflake size={48} />
                <span className="ml-2 text-xl">Escaneando...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Camera size={48} />
                <span className="ml-2 text-xl">Tirar Foto da Temperatura</span>
              </div>
            )}
          </button>
        </CardContent>
      </Card>

      {temperature && (
        <Alert className={status === 'normal' ? 'bg-green-50' : 'bg-red-50'}>
          <AlertTitle className="flex items-center">
            {status === 'normal' ? (
              <Check className="h-6 w-6 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            )}
            Temperatura Atual
          </AlertTitle>
          <AlertDescription className="text-2xl font-bold mt-2">
            {temperature}°C
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Último Registro:</h2>
        <div className="text-gray-600">
          <p>Data: {new Date().toLocaleDateString()}</p>
          <p>Hora: {new Date().toLocaleTimeString()}</p>
          <p>Responsável: João Silva</p>
        </div>
      </div>
    </div>
  );
};

export default TemperatureMonitoring;
