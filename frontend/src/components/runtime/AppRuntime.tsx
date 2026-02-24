import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import CalculatorRuntime from './CalculatorRuntime';
import { AppData } from '../../generation/types';

interface AppRuntimeProps {
  data: AppData;
}

export default function AppRuntime({ data }: AppRuntimeProps) {
  // Always call hooks at the top level
  const [tasks, setTasks] = useState(data.tasks || []);

  const toggleTask = (index: number) => {
    setTasks((prev: any[]) =>
      prev.map((task, i) => (i === index ? { ...task, completed: !task.completed } : task))
    );
  };

  // Check discriminator to determine which runtime to render AFTER hooks
  if (data.appKind === 'calculator') {
    return <CalculatorRuntime data={data} />;
  }

  // Default task-list runtime
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{data.title || 'App Preview'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task: any, index: number) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(index)} />
              <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                {task.text}
              </span>
            </div>
          ))}
          {data.actions?.map((action: string, index: number) => (
            <Button key={index} variant="outline" className="w-full">
              {action}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
