import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { 
  Utensils, Heart, Leaf, 
  AlertTriangle, Calendar, 
  ChevronLeft, ChevronRight,
  Star
} from 'lucide-react';

const MenuSystem = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const menuItems = [
    {
      id: 1,
      name: "Arroz Integral com Legumes",
      category: "Prato Principal",
      healthScore: 95,
      calories: 350,
      allergies: ["glúten"],
      nutrients: {
        protein: "15g",
        carbs: "45g",
        fat: "8g"
      }
    },
    {
      id: 2,
      name: "Salada de Quinoa",
      category: "Acompanhamento",
      healthScore: 98,
      calories: 220,
      allergies: [],
      nutrients: {
        protein: "8g",
        carbs: "28g",
        fat: "12g"
      }
    }
  ];

  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cardápio da Semana</h1>

      <div className="flex items-center justify-between mb-6">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar size={24} />
          <span className="text-lg">Semana de {currentWeek.toLocaleDateString()}</span>
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {menuItems.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <span className="text-sm text-gray-600">{item.category}</span>
                </div>
                
                <div className={`${getHealthScoreColor(item.healthScore)} text-white px-3 py-1 rounded-full flex items-center gap-1`}>
                  <Star size={16} />
                  <span>{item.healthScore}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{item.calories}</div>
                  <div className="text-sm text-gray-600">Calorias</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{item.nutrients.protein}</div>
                  <div className="text-sm text-gray-600">Proteínas</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{item.nutrients.carbs}</div>
                  <div className="text-sm text-gray-600">Carboidratos</div>
                </div>
              </div>

              {item.allergies.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-yellow-600">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Contém: {item.allergies.join(', ')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-4 right-4 space-y-2">
        <button className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <Leaf size={24} />
        </button>
        <button className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <Heart size={24} />
        </button>
      </div>
    </div>
  );
};

export default MenuSystem;