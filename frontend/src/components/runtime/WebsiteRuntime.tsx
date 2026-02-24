import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useState } from 'react';

interface WebsiteRuntimeProps {
  data: any;
}

export default function WebsiteRuntime({ data }: WebsiteRuntimeProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = data.pages || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {pages.map((page: any, index: number) => (
          <Button
            key={index}
            variant={currentPage === index ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPage(index)}
          >
            {page.title}
          </Button>
        ))}
      </div>

      {pages[currentPage] && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">{pages[currentPage].title}</h2>
            <div className="prose prose-sm max-w-none">
              <p>{pages[currentPage].content}</p>
            </div>
            {pages[currentPage].image && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">{pages[currentPage].image}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
