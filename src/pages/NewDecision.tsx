import React from 'react';
import { DecisionForm } from '../components/DecisionForm';

export function NewDecision() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <DecisionForm />
      </div>
    </div>
  );
}