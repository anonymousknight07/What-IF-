import React from 'react';
import { WhatIfAnalysis } from '../components/WhatIfAnalysis';

export function WhatIf() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <WhatIfAnalysis />
      </div>
    </div>
  );
}