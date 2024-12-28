import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Verificar temperatura do freezer 1",
      time: "08:00",
      status: "pending", // pending, completed, late
      responsible: "Maria Silva",
      priority: "high"
    },
    {
      id: 2,
      title: "Limpeza da área de preparo",
      time: "09:30",
      status: "completed",
      responsible: "João Santos",
      priority: "medium"
    },
    {
      id: 3,
      title: "Conferir estoque de vegetais",
      time: "10:00",
      status: "late",
      responsible: "Ana Oliveira",
      priority: "high"
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 border-green-500';
      case 'late':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-yellow-100 border-yellow-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle2 className="text-green-600" />;
      case 'late':
        return <AlertCircle className="text-red-600" />;
      default:
        return <Clock className="text-yellow-600" />;
    }
  };

  const completeTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tarefas de Hoje</h1>
        <div className="flex items-center gap-2">
          <Calendar size={24} />
          <span className="text-lg">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded-full"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded-full"></div>
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded-full"></div>
          <span>Atrasada</span>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card 
            key={task.id}
            className={`cursor-pointer transition-all border-l-4 ${getStatusColor(task.status)}`}
            onClick={() => completeTask(task.id)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Horário: {task.time}</span>
                  <span>Responsável: {task.responsible}</span>
                </div>
              </div>

              {task.priority === 'high' && (
                <span className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Prioritário
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-4 right-4">
        <button className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <Clock size={24} />
        </button>
      </div>
    </div>
  );
};

export default TaskManagement;
