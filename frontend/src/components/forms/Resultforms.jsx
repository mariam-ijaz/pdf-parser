import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

const PageSummaryTable = ({ pageSummary }) => {
  return (
    <div className="mt-6 bg-gray-100 p-4 rounded-xl">
      <h4 className="text-base font-bold text-black mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-black rounded"></div>
        Page Details Overview
      </h4>
      
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border-2 border-gray-300 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                    PDF Page #
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Printed Page #
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Questions Found
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-100 divide-y divide-gray-200">
                {pageSummary?.map((page, idx) => {
                  const hasPageNumber = page.printedPage !== null
                  const hasQuestions = page.range !== null
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-200 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-black bg-gray-300 px-3 py-1 rounded-lg">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {hasPageNumber ? (
                          <span className="text-black font-bold bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-300">
                            📄 {page.printedPage}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600 font-semibold">
                            <XCircle className="w-4 h-4" />
                            Not Available
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        {hasQuestions ? (
                          <div className="flex flex-wrap gap-2">
                            {page.questionStarts?.map((qNum, qIdx) => (
                              <span 
                                key={qIdx}
                                className="px-2.5 py-1 bg-gray-300 text-black rounded-md font-bold text-xs border border-gray-400"
                              >
                                Q{qNum}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-600 font-semibold italic">No Questions</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                        {hasPageNumber && hasQuestions ? (
                          <span className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle2 className="w-5 h-5" />
                            Complete
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-amber-600 font-semibold">
                            <AlertCircle className="w-5 h-5" />
                            Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const PDFResultCard = ({ result, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0)

  const hasIssues = result.pageSummary?.some(page => 
    page.printedPage === null || page.range === null
  )

  return (
    <div className="card hover:shadow-2xl border-2 border-slate-200 hover:border-primary-300 transition-all duration-300">
      <div 
        className="flex items-start justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-4 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow">
            <FileText className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 truncate group-hover:text-primary-700 transition-colors">
              {result.fileName}
            </h3>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span className="text-slate-600 font-medium">Total Pages:</span>
                <span className="font-bold text-primary-700 text-base">{result.totalPages}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
              <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200">
                📄 {result.printedPageSequence?.filter(p => p !== null).length || 0} Pages Numbered
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                {result.pageSummary?.filter(p => p.range !== null).length || 0} With Questions
              </div>
            </div>
          </div>
        </div>

        <button className="p-3 hover:bg-primary-50 rounded-xl transition-all duration-200 ml-4 flex-shrink-0 border border-transparent hover:border-primary-200">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-primary-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-slate-500 group-hover:text-primary-600" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t-2 border-slate-200">
          <div className="mb-6">
            <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary-600 rounded"></div>
              Printed Page Sequence
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {result.printedPageSequence?.map((page, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    page === null
                      ? 'bg-red-50 text-red-700 border-2 border-red-300 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-primary-400 hover:shadow-md'
                  }`}
                >
                  {page === null ? 'No Page #' : `📄 ${page}`}
                </div>
              ))}
            </div>
          </div>

          {/* Restored PageSummaryTable */}
          <PageSummaryTable pageSummary={result.pageSummary} />
        </div>
      )}
    </div>
  )
}

export default PDFResultCard