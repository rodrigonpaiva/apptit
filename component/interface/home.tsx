import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Thermometer, CheckSquare, Package, Utensils } from 'lucide-react';

const AppInterface = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 1,
      title: "Monitoramento de Temperatura",
      icon: <Thermometer size={32} />,
      color: "bg-blue-500",
      description: "Controle a temperatura dos equipamentos"
    },
    {
      id: 2,
      title: "Tarefas Diárias",
      icon: <CheckSquare size={32} />,
      color: "bg-green-500",
      description: "Organize suas atividades do dia"
    },
    {
      id: 3,
      title: "Controle de Estoque",
      icon: <Package size={32} />,
      color: "bg-purple-500",
      description: "Gerencie produtos e fornecedores"
    },
    {
      id: 4,
      title: "Cardápio Inteligente",
      icon: <Utensils size={32} />,
      color: "bg-orange-500",
      description: "Planeje cardápios nutritivos"
    }
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Serviços Disponíveis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedService(service.id)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`${service.color} p-3 rounded-full text-white`}>
                {service.icon}
              </div>
              <h2 className="text-xl font-semibold">{service.title}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppInterface;
