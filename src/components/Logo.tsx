import React from 'react';
import { Tv2 } from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
      <Tv2 className="text-white w-6 h-6" />
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Jesús TV
      </span>
      <span className="text-xs text-pink-500">Argentina</span>
    </div>
  </div>
);