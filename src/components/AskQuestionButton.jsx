'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AskQuestionButton() {
  const router = useRouter();

  return (
    <Button 
      onClick={() => router.push('/ask-question')}
      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
    >
      <PlusCircle className="h-5 w-5" />
      Ask Question
    </Button>
  );
}