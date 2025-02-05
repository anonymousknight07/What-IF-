import React from 'react';
import { DecisionHistory } from '../components/DecisionHistory';

export function History() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <DecisionHistory />
      </div>
    </div>
  );
}