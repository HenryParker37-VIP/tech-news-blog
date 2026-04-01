import React from 'react';

function Footer() {
    return (
          <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <span className="text-xl font-bold text-white">TechPulse</span>
              <p className="text-sm mt-1">Automated tech news, updated every 6 hours.</p>
      </div>
            <div className="text-sm text-center md:text-right">
                  <p>Sources: HackerNews, Dev.to, TechCrunch</p>
              <p className="mt-1">&copy; {new Date().getFullYear()} TechPulse. All rights reserved.</p>
      </div>
      </div>
          <div className="border-t border-gray-600 mt-6 pt-5 text-center text-sm text-gray-400">
                <p>
                  Built &amp; maintained by{' '}
              <span className="text-white font-semibold">Nguyen Manh Tuan Hung (Henry Parker)</span>
                </p>
            <p className="mt-1">
                            Found a bug or issue?{' '}
                            <a
                              href="mailto:numberisno1@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                                Contact me at henryparker0307@gmail.com
                  </a>
                  </p>
                  </div>
                  </div>
                  </footer>
    );
}

export default Footer;
