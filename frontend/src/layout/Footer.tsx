import React from 'react';

const Footer = () => {
  return (
    <footer className="py-8 border-t bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 mt-auto transition-colors duration-300">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-200">
              Lead Dashboard
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-center text-gray-500 md:mt-4">
          &copy; {new Date().getFullYear()} Lead Dashboard. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
