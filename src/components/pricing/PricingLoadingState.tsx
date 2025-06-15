
import React from 'react';

export default function PricingLoadingState() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full w-32 mx-auto animate-pulse"></div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-96 mx-auto animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index} 
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 space-y-6 animate-pulse"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-2xl mx-auto"></div>
            
            {/* Title */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            
            {/* Price */}
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2 mx-auto"></div>
            
            {/* Features */}
            <div className="space-y-3">
              <div className="h-20 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Button */}
            <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="mt-16 space-y-8">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 space-y-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
