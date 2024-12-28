import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Camera, BarChart, Package, AlertTriangle, Search, Plus } from 'lucide-react';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  const inventory = [
    {
      id: 1,
      name: "Arroz Integral",
      quantity: 50,
      unit: "kg",
      status: "normal",
      expiration: "2024-12-20"
    },
    {
      id: 2,
      name: "Feijão Preto",
      quantity: 15,
      unit: "kg",
      status: "low",
      expiration: "2024-11-15"
    },
    {
      id: 3,
      name: "Tomate",
      quantity: 20,
      unit: "kg",
      status: "warning",
      expiration: "2024-01-05"
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'low':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestão de Estoque</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('scan')}
        >
          <CardContent className="p-6 flex flex-col items-center">
            <Camera size={32} className="mb-2" />
            <span className="text-lg">Escanear Nota</span>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('inventory')}
        >
          <CardContent className="p-6 flex flex-col items-center">
            <Package size={32} className="mb-2" />
            <span className="text-lg">Ver Estoque</span>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-4">
        {inventory.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
                  {item.quantity} {item.unit}
                </span>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Validade: {new Date(item.expiration).toLocaleDateString()}</span>
                  {new Date(item.expiration) < new Date() && (
                    <AlertTriangle className="text-red-500" size={16} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <button className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <BarChart size={24} />
        </button>
        <button className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default InventoryManagement;
