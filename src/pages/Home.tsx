import  { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Scale, History } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BrainModel } from '../components/BrainModel';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="relative h-[50vh] mb-12">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <BrainModel />
            <OrbitControls enableZoom={false} />
          </Suspense>
        </Canvas>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-accent mb-6">What If</h1>
          <p className="text-xl text-accent/80 mb-12">Explore the possibilities with AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/new-decision" className="transform hover:scale-105 transition-transform">
            <div className="bg-primary/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-accent/20">
              <div className="flex justify-center mb-4">
                <Brain className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-accent mb-4">New Decision</h2>
              <p className="text-accent/80">Get AI-powered analysis for your current decisions</p>
            </div>
          </Link>

          <Link to="/what-if" className="transform hover:scale-105 transition-transform">
            <div className="bg-primary/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-accent/20">
              <div className="flex justify-center mb-4">
                <Scale className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-accent mb-4">What-If Analysis</h2>
              <p className="text-accent/80">Explore alternative scenarios for past decisions</p>
            </div>
          </Link>

          <Link to="/history" className="transform hover:scale-105 transition-transform">
            <div className="bg-primary/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-accent/20">
              <div className="flex justify-center mb-4">
                <History className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-accent mb-4">Decision History</h2>
              <p className="text-accent/80">View and analyze your past decisions</p>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-accent mb-6">Why Use What If?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-primary/10 backdrop-blur-sm rounded-lg p-6 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">AI-Powered Insights</h4>
              <p className="text-accent/80">Get intelligent analysis based on your specific situation</p>
            </div>
            <div className="bg-primary/10 backdrop-blur-sm rounded-lg p-6 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">Learn from the Past</h4>
              <p className="text-accent/80">Analyze alternative scenarios and improve future decisions</p>
            </div>
            <div className="bg-primary/10 backdrop-blur-sm rounded-lg p-6 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">Track Progress</h4>
              <p className="text-accent/80">Visualize your decision journey with interactive graphs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}