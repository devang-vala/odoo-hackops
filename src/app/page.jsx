import { Suspense } from 'react';
import HomePage from '@/components/Homepage';

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}

function HomePageSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white border-2 border-gray-200 p-4 mb-4 flex flex-wrap justify-between items-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-10 w-24 bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          </div>
          
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i}
              className="bg-white border-2 border-gray-200 p-4 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
            >
              <div className="flex">
                <div className="w-10 mr-4 flex flex-col items-center">
                  <div className="w-6 h-6 bg-gray-100 mb-1"></div>
                  <div className="w-4 h-4 bg-gray-100"></div>
                  <div className="w-6 h-6 bg-gray-100 mt-1"></div>
                </div>
                <div className="flex-1">
                  <div className="h-7 bg-gray-100 w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-50 w-full mb-2"></div>
                  <div className="h-4 bg-gray-50 w-5/6 mb-4"></div>
                  <div className="flex gap-2">
                    {[1, 2].map(tag => (
                      <div key={tag} className="h-6 w-16 bg-gray-100"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="hidden lg:block lg:w-72">
          <div className="bg-white border-2 border-gray-200 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="h-5 bg-gray-100 w-1/2 mb-3"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-6 w-16 bg-gray-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}