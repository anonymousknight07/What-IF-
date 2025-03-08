import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Brain, Scale } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DecisionGraph } from './DecisionGraph';

interface Choice {
  id: string;
  text: string;
  score?: number;
}

interface AnalysisResult {
  recommendation: string;
  reasoning: string;
  pros: string[];
  cons: string[];
  scores: Record<string, number>;
}

interface TrackedDecision {
  id: string;
  date: string;
  situation: string;
  choiceMade: string;
  outcome: string;
}

export function DecisionForm() {
  const [situation, setSituation] = useState('');
  const [choices, setChoices] = useState<Choice[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTrackingPrompt, setShowTrackingPrompt] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
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
      .replace(/^## (.*?)$/gm, "<h2 style='font-size: 1.75em;'>$1</h2>")
      .replace(/^### (.*?)$/gm, "<h3 style='font-size: 1.5em;'>$1</h3>")
      .replace(/\n/g, "<br />")
      .replace(/^- (.*?)$/gm, "<ul><li style='font-size: 1.1em;'>$1</li></ul>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  };

  const addChoice = () => {
    if (choices.length < 5) {
      setChoices([...choices, { id: String(choices.length + 1), text: '' }]);
    }
  };

  const removeChoice = (id: string) => {
    if (choices.length > 2) {
      setChoices(choices.filter(choice => choice.id !== id));
    }
  };

  const updateChoice = (id: string, text: string) => {
    setChoices(choices.map(choice => 
      choice.id === id ? { ...choice, text } : choice
    ));
    setResult(null);
  };

  const analyzeDecision = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setShowTrackingPrompt(false);
      setShowGraph(false);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API key is missing');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As a decision analysis expert, analyze this decision:
Situation: ${situation}
Choices:
${choices.map(c => `- ${c.text}`).join('\n')}

Required Format:
Recommendation:
[Clear recommendation]

Reasoning:
[Supporting points]

Pros:
[List pros]

Cons:
[List cons]

Scores (provide a percentage score for each choice, must add up to 100):
${choices.map(c => `${c.text}: [score]%`).join('\n')}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      const sections = {
        recommendation: '',
        reasoning: '',
        pros: [] as string[],
        cons: [] as string[],
        scores: {} as Record<string, number>
      };

      const recommendationMatch = analysisText.match(/Recommendation:([\s\S]*?)(?=Reasoning:|$)/i);
      sections.recommendation = recommendationMatch?.[1].trim() || 'No recommendation provided';
      
      const reasoningMatch = analysisText.match(/Reasoning:([\s\S]*?)(?=Pros:|$)/i);
      sections.reasoning = reasoningMatch?.[1].trim() || 'No reasoning provided';
      
      const prosMatch = analysisText.match(/Pros:([\s\S]*?)(?=Cons:|$)/i);
      if (prosMatch) {
        sections.pros = prosMatch[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && line.startsWith('-'))
          .map(line => line.slice(1).trim());
      }
      
      const consMatch = analysisText.match(/Cons:([\s\S]*?)(?=Scores:|$)/i);
      if (consMatch) {
        sections.cons = consMatch[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && line.startsWith('-'))
          .map(line => line.slice(1).trim());
      }

      const scoresMatch = analysisText.match(/Scores:([\s\S]*?)$/i);
      if (scoresMatch) {
        const scoreLines = scoresMatch[1].split('\n').filter(line => line.trim());
        let totalScore = 0;
        
        choices.forEach(choice => {
          const scoreLine = scoreLines.find(line => line.includes(choice.text));
          const scoreMatch = scoreLine?.match(/(\d+)%/);
          const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
          sections.scores[choice.id] = score;
          totalScore += score;
        });

        if (totalScore !== 100 && totalScore > 0) {
          Object.keys(sections.scores).forEach(id => {
            sections.scores[id] = Math.round((sections.scores[id] / totalScore) * 100);
          });
        }
      }

      setResult({
        recommendation: sections.recommendation,
        reasoning: sections.reasoning,
        pros: sections.pros.length ? sections.pros : ['No specific pros mentioned'],
        cons: sections.cons.length ? sections.cons : ['No specific cons mentioned'],
        scores: sections.scores
      });
      
      setShowTrackingPrompt(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message.includes('SAFETY')
          ? 'This question contains sensitive content. Please rephrase your question.'
          : err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const trackCurrentDecision = () => {
    if (!result) return;
    
    const recommendedChoice = choices.find(choice => 
      result.scores[choice.id] === Math.max(...Object.values(result.scores))
    );

    if (!recommendedChoice) return;

    const newDecision: TrackedDecision = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      situation,
      choiceMade: recommendedChoice.text,
      outcome: result.recommendation
    };

    const updatedDecisions = [...trackedDecisions, newDecision];
    setTrackedDecisions(updatedDecisions);
    localStorage.setItem('trackedDecisions', JSON.stringify(updatedDecisions));
    setShowTrackingPrompt(false);
    setShowGraph(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm("🤔 Hey there, decision-maker!\n\nJust a friendly reminder that while I'm pretty smart (and quite charming, if I do say so myself), I'm just an AI giving suggestions.\n\nThe final choice is all yours - after all, you're the one who has to live with it! 😉\n\nShall we proceed with the analysis?");
    
    if (confirmed) {
      await analyzeDecision();
    }
  };

  const formatDecisionAnalysisOutput = (result: AnalysisResult | null, choices: Choice[]) => {
    if (!result) return null;
  
    return (
      <div className="mt-8 space-y-8">
        <div className="bg-primary/20 rounded-lg shadow-md p-6 border border-accent/20">
          <h3 className="text-xl font-semibold text-accent mb-4">Choice Analysis</h3>
          <div className="space-y-4">
            {choices.map((choice) => (
              <div key={choice.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-accent">{choice.text}</span>
                  <span className="text-sm font-medium text-accent/80">
                    {result.scores[choice.id]}%
                  </span>
                </div>
                <div className="w-full bg-primary/30 rounded-full h-2.5">
                  <div
                    className="bg-accent/50 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${result.scores[choice.id]}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <div className="bg-primary/20 rounded-lg shadow-md p-6 border border-accent/20">
          <h3 className="text-xl font-semibold text-accent mb-4">Detailed Analysis</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-accent mb-2">Recommendation</h4>
              <p
                className="text-accent/80 bg-primary/30 p-4 rounded-lg"
                dangerouslySetInnerHTML={{ __html: formatText(result.recommendation) }}
              />
            </div>
            <div>
              <h4 className="font-medium text-accent mb-2">Reasoning</h4>
              <p
                className="text-accent/80 bg-primary/30 p-4 rounded-lg"
                dangerouslySetInnerHTML={{ __html: formatText(result.reasoning) }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/30 p-4 rounded-lg">
                <h4 className="font-medium text-accent mb-2">Pros</h4>
                <ul className="list-disc list-inside text-accent/80 space-y-1">
                  {result.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary/30 p-4 rounded-lg">
                <h4 className="font-medium text-accent mb-2">Cons</h4>
                <ul className="list-disc list-inside text-accent/80 space-y-1">
                  {result.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-primary/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-accent/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex items-center gap-4 p-4 bg-primary/20 rounded-lg border border-accent/20">
          <Brain className="w-8 h-8 text-accent" />
          <div>
            <h3 className="font-semibold text-accent">AI Analysis</h3>
            <p className="text-sm text-accent/80">Get intelligent insights</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-primary/20 rounded-lg border border-accent/20">
          <Scale className="w-8 h-8 text-accent" />
          <div>
            <h3 className="font-semibold text-accent">Compare Choices</h3>
            <p className="text-sm text-accent/80">Weigh your options</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-accent mb-2">
            Describe your situation
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => {
              setSituation(e.target.value);
              setResult(null);
              setShowTrackingPrompt(false);
              setShowGraph(false);
            }}
            className="w-full h-32 px-4 py-2 bg-primary/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-accent placeholder-accent/50"
            placeholder="What's on your mind? Describe the decision you need to make..."
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-accent">
              Your choices (2-5 options)
            </label>
            <button
              type="button"
              onClick={addChoice}
              disabled={choices.length >= 5}
              className="text-accent hover:text-accent/80 disabled:text-accent/40"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {choices.map((choice) => (
            <div key={choice.id} className="flex gap-2">
              <input
                type="text"
                value={choice.text}
                onChange={(e) => updateChoice(choice.id, e.target.value)}
                placeholder={`Choice ${choice.id}`}
                className="flex-1 px-4 py-2 bg-primary/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-accent placeholder-accent/50"
                required
              />
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeChoice(choice.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <MinusCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent/20 text-accent py-3 px-6 rounded-lg hover:bg-accent/30 transition-colors duration-200 disabled:bg-accent/10 disabled:text-accent/50 border border-accent/20"
        >
          {loading ? 'Analyzing...' : 'Analyze My Decision'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-400/20">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-8">
          {showTrackingPrompt && (
            <div className="bg-primary/20 p-6 rounded-lg mb-8 border border-accent/20">
              <h4 className="text-lg font-semibold text-accent mb-4">
                Would you like to track this decision?
              </h4>
              <div className="flex gap-4">
                <button
                  onClick={trackCurrentDecision}
                  className="px-6 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors border border-accent/20"
                >
                  Yes, track it
                </button>
                <button
                  onClick={() => {
                    setShowTrackingPrompt(false);
                    setSituation('');
                    setChoices([
                      { id: '1', text: '' },
                      { id: '2', text: '' },
                    ]);
                  }}
                  className="px-6 py-2 bg-primary/20 text-accent/60 rounded-lg hover:bg-primary/30 transition-colors border border-accent/20"
                >
                  No, skip
                </button>
              </div>
            </div>
          )}

          {showGraph && trackedDecisions.length > 0 && (
            <div className="mb-8 bg-primary rounded-lg p-4 border border-accent/20">
              <h3 className="text-xl font-semibold text-accent mb-4">Decision Timeline</h3>
              <DecisionGraph decisions={trackedDecisions} />
            </div>
          )}

          {formatDecisionAnalysisOutput(result, choices)}
        </div>
      )}
    </div>
  );
}