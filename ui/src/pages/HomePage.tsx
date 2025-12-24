import { Calculator, Dumbbell } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Calculator className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Macro Calculator
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Calculate Your
              <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Perfect Macros
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Get personalized macro calculations based on your body metrics, goals, and workout schedule. 
              Optimize your nutrition for maximum results.
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Form Coming Soon</h3>
            <p className="text-slate-400 mb-6">
              The user input form and workout calendar will be implemented in Phase 3.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                Age & Gender
              </span>
              <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                Weight & Height
              </span>
              <span className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
                Goals
              </span>
              <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                Workout Schedule
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>Macro Calculator — Calculate your perfect nutrition plan</p>
      </footer>
    </div>
  );
}

