import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface WhatIfResult {
  alternativeOutcome: string;
  impacts: string[];
  opportunities: string[];
  risks: string[];
}

interface TrackedDecision {
  id: string;
  date: string;
  situation: string;
  choiceMade: string;
  outcome: string;
}

export function WhatIfAnalysis() {
  const [pastDecision, setPastDecision] = useState('');
  const [choiceMade, setChoiceMade] = useState('');
  const [alternativeChoice, setAlternativeChoice] = useState('');
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [decisionOutcome, setDecisionOutcome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [trackedDecisions, setTrackedDecisions] = useState<TrackedDecision[]>(() => {
    const saved = localStorage.getItem('trackedDecisions');
    return saved ? JSON.parse(saved) : [];
  });

  const formatText = (text: string) => {
    if (!text) return "";
    text = text.replace(/^\*\*(.*?)\*\*$/s, "$1");
    text = text.replace(/\*\*/g, "");
    return text
      .replace(/^# (.*?)$/gm, "<h1 style='font-size: 2em;'>$1</h1>")
      .replace(/^## (.*?)$/gm, "<h2 style='font-size: 1.75em;'>$2</h2>")
      .replace(/^### (.*?)$/gm, "<h3 style='font-size: 1.5em;'>$3</h3>")
      .replace(/\n/g, "<br />")
      .replace(/^- (.*?)$/gm, "<ul><li style='font-size: 1.1em;'>$1</li></ul>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  };

  const saveDecision = () => {
    if (!decisionOutcome.trim()) return;

    const newDecision: TrackedDecision = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      situation: pastDecision,
      choiceMade,
      outcome: decisionOutcome
    };

    const updatedDecisions = [...trackedDecisions, newDecision];
    setTrackedDecisions(updatedDecisions);
    localStorage.setItem('trackedDecisions', JSON.stringify(updatedDecisions));
    setDecisionOutcome('');
  };

  const analyzeWhatIf = async () => {
    try {
      setWhatIfLoading(true);
      setError(null);
      setWhatIfResult(null);
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API key is missing');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As a decision analysis expert, provide a detailed "What If" analysis for this scenario:
Past Situation: ${pastDecision}
Choice Made: ${choiceMade}
Alternative Choice: ${alternativeChoice}

Please structure your response in these exact sections:
1. Alternative Timeline (What would likely have happened)
2. Direct Impacts (Immediate effects on key areas)
3. Long-term Implications (Future opportunities and challenges)
4. Key Learnings (What can be learned from this analysis)`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      const sections = {
        alternativeOutcome: '',
        impacts: [] as string[],
        opportunities: [] as string[],
        risks: [] as string[]
      };

      const parts = analysisText.split(/\d+\./g).filter(Boolean);
      if (parts.length >= 4) {
        sections.alternativeOutcome = parts[0].trim();
        sections.impacts = parts[1].split('\n').filter(line => line.trim()).map(line => line.trim());
        sections.opportunities = parts[2].split('\n').filter(line => line.trim()).map(line => line.trim());
        sections.risks = parts[3].split('\n').filter(line => line.trim()).map(line => line.trim());
      }

      setWhatIfResult({
        alternativeOutcome: sections.alternativeOutcome,
        impacts: sections.impacts,
        opportunities: sections.opportunities,
        risks: sections.risks
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message.includes('SAFETY') 
          ? 'This question contains sensitive content. Please rephrase your question.'
          : err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setWhatIfLoading(false);
    }
  };

  const handleWhatIfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm("🎮 Welcome to the 'What If' time machine!\n\nRemember: While I can show you alternate timelines, I can't actually change the past (still working on that feature 😅).\n\nThe insights are for fun and learning - use them wisely!\n\nReady to explore some alternate realities?");
    
    if (confirmed) {
      await analyzeWhatIf();
    }
  };

  const formatWhatIfOutput = (whatIfResult: WhatIfResult | null) => {
    if (!whatIfResult) return null;
  
    return (
      <div className="mt-8 space-y-6">
        <div className="bg-primary/20 backdrop-blur-sm rounded-lg shadow-md p-6 border border-accent/20">
          <h3 className="text-xl font-semibold text-accent mb-4">What-If Analysis Results</h3>
  
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-accent mb-2">Alternative Timeline</h4>
              <ul className="list-disc list-inside text-accent/80 space-y-2 bg-primary/30 p-4 rounded-lg">
                {whatIfResult.impacts.map((impact, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: formatText(impact) }} />
                ))}
              </ul>
            </div>
  
            <div>
              <h4 className="font-medium text-accent mb-2">Direct Impacts</h4>
              <ul className="list-disc list-inside text-accent/80 space-y-2 bg-primary/30 p-4 rounded-lg">
                {whatIfResult.opportunities.map((opportunity, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: formatText(opportunity) }} />
                ))}
              </ul>
            </div>
  
            <div>
              <h4 className="font-medium text-accent mb-2">Long-term Implications</h4>
              <ul className="list-disc list-inside text-accent/80 space-y-2 bg-primary/30 p-4 rounded-lg">
                {whatIfResult.risks.map((risk, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: formatText(risk) }} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-primary/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-accent/20">
      <form onSubmit={handleWhatIfSubmit} className="space-y-6">
        <div>
          <label htmlFor="pastDecision" className="block text-sm font-medium text-accent mb-2">
            Describe the past situation
          </label>
          <textarea
            id="pastDecision"
            value={pastDecision}
            onChange={(e) => {
              setPastDecision(e.target.value);
              setWhatIfResult(null);
            }}
            className="w-full h-32 px-4 py-2 bg-primary/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-accent placeholder-accent/50"
            placeholder="What was the situation you faced?"
            required
          />
        </div>

        <div>
          <label htmlFor="choiceMade" className="block text-sm font-medium text-accent mb-2">
            What choice did you make?
          </label>
          <input
            type="text"
            id="choiceMade"
            value={choiceMade}
            onChange={(e) => {
              setChoiceMade(e.target.value);
              setWhatIfResult(null);
            }}
            className="w-full px-4 py-2 bg-primary/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-accent placeholder-accent/50"
            placeholder="Describe the choice you made"
            required
          />
        </div>

        <div>
          <label htmlFor="alternativeChoice" className="block text-sm font-medium text-accent mb-2">
            What alternative choice would you like to explore?
          </label>
          <input
            type="text"
            id="alternativeChoice"
            value={alternativeChoice}
            onChange={(e) => {
              setAlternativeChoice(e.target.value);
              setWhatIfResult(null);
            }}
            className="w-full px-4 py-2 bg-primary/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-accent placeholder-accent/50"
            placeholder="Describe the alternative choice you're curious about"
            required
          />
        </div>

        <div>
          <label htmlFor="decisionOutcome" className="block text-sm font-medium text-accent mb-2">
            What was the actual outcome of your choice?
          </label>
          <textarea
            id="decisionOutcome"
            value={decisionOutcome}
            onChange={(e) => setDecisionOutcome(e.target.value)}
            className="w-full h-32 px-4 py-2 bg-primary/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-accent placeholder-accent/50"
            placeholder="Describe what actually happened after making your choice..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={whatIfLoading}
            className="flex-1 bg-accent/20 text-accent py-3 px-6 rounded-lg hover:bg-accent/30 transition-colors duration-200 disabled:bg-accent/10 disabled:text-accent/50 border border-accent/20"
          >
            {whatIfLoading ? 'Analyzing...' : 'Analyze What If Scenario'}
          </button>
          
          <button
            type="button"
            onClick={saveDecision}
            disabled={!decisionOutcome.trim()}
            className="flex-1 bg-accent/20 text-accent py-3 px-6 rounded-lg hover:bg-accent/30 transition-colors duration-200 disabled:bg-accent/10 disabled:text-accent/50 border border-accent/20"
          >
            Track This Decision
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-400/20">
          {error}
        </div>
      )}

      {formatWhatIfOutput(whatIfResult)}
    </div>
  );
}