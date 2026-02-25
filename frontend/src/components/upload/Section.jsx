import { useState, useRef } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { analyzePDFs } from '../../services/api'
import LoadingSpinner from '../AppCommon/Spinner'

const UploadSection = ({ onAnalysisComplete, isLoading, setIsLoading }) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    )
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles) => {
    setError(null)
    if (files.length + newFiles.length > 10) {
      setError('Maximum 10 files allowed')
      return
    }
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await analyzePDFs(files)
      onAnalysisComplete(result)
    } catch (err) {
      setError(err.message || 'Failed to analyze PDFs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-black leading-tight">
          Efficient Question Mapping for Your PDFs
        </h2>
        <p className="text-black text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
          Seamlessly upload your exam PDFs to receive immediate and accurate mapping of page numbers, question ranges, and document structure.
        </p>
      </div>

      <div className="card">
        <div
          className={`upload-area ${isDragging ? 'drag-over' : ''} bg-white border-black`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-400 blur-xl opacity-30 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-black-to-black p-5 rounded-2xl shadow-lg">
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 text-black" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-black mb-3">
                Upload your PDF documents here
              </p>
              <p className="text-base sm:text-lg text-black mb-2">
                Click to select files from your device
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileSelect}
              className="input-file"
            />
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" />
              Selected Files ({files.length}/10)
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-black flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors ml-2 flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || files.length === 0}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-jetblack"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>Analyzing PDFs...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Analyze {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'PDFs'}</span>
              </>
            )}
          </button>

          {files.length > 0 && !isLoading && (
            <button
              onClick={() => {
                setFiles([])
                setError(null)
              }}
              className="px-6 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300"
            >
              Reset All
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadSection