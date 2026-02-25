import { useState } from 'react'
import UploadSection from './components/upload/Section'
import PDFResultCard from './components/forms/Resultforms'
import Footer from './components/layout/Footer'

function App() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalysisComplete = (data) => {
    setResults(data)
  }

  const handleReset = () => {
    setResults(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!results ? (
            <UploadSection 
              onAnalysisComplete={handleAnalysisComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <div className="space-y-6">
              {results?.results?.map((result, index) => (
                <PDFResultCard key={index} result={result} index={index} />
              ))}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300"
                >
                  New Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App