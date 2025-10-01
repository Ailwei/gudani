import React from 'react';
import { Brain } from 'lucide-react';

const Footer: React.FC = () => {
  return(
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold">GudaniAI</span>
          </div>
          <p className="text-gray-400">
            Empowering high school students with AI-powered learning tools.
          </p>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2025 GudaniAI. All rights reserved.</p>
      </div>
        
      </div>
      
    </div>
  </footer>
);
}

export default Footer;
