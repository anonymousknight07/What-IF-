import  { useState, useEffect } from 'react';
import { MinusCircle } from 'lucide-react';
import { DecisionGraph } from './DecisionGraph';

interface TrackedDecision {
  id: string;
  date: string;
  situation: string;
  choiceMade: string;
  outcome: string;
}

export function DecisionHistory() {
  const [trackedDecisions, setTrackedDecisions] = useState<TrackedDecision[]>([]);

  useEffect(() => {
    const savedDecisions = localStorage.getItem('trackedDecisions');
    if (savedDecisions) {
      setTrackedDecisions(JSON.parse(savedDecisions));
    }
  }, []);

  const deleteDecision = (id: string) => {
    const updatedDecisions = trackedDecisions.filter(d => d.id !== id);
    setTrackedDecisions(updatedDecisions);
    localStorage.setItem('trackedDecisions', JSON.stringify(updatedDecisions));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-accent">Decision History</h3>
      
      {trackedDecisions.length === 0 ? (
        <p className="text-accent/80 text-center py-8">No decisions tracked yet.</p>
      ) : (
        <>
          <div className="bg-primary rounded-lg p-4 border border-accent/20 mb-8">
            <DecisionGraph decisions={trackedDecisions} />
          </div>
          <div className="space-y-4 mt-8">
            {trackedDecisions.map((decision) => (
              <div key={decision.id} className="bg-primary/10 backdrop-blur-sm p-4 rounded-lg shadow-md border border-accent/20">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm text-accent/60">
                      {new Date(decision.date).toLocaleDateString()}
                    </p>
                    <h4 className="font-medium text-accent">Situation:</h4>
                    <p className="text-accent/80">{decision.situation}</p>
                    <h4 className="font-medium text-accent">Choice Made:</h4>
                    <p className="text-accent/80">{decision.choiceMade}</p>
                    <h4 className="font-medium text-accent">Outcome:</h4>
                    <p className="text-accent/80">{decision.outcome}</p>
                  </div>
                  <button
                    onClick={() => deleteDecision(decision.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}