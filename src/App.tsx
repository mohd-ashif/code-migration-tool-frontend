import { useState, useEffect } from 'react';
import { FileArchive, RefreshCw } from 'lucide-react';
import UploadZone from './components/UploadZone';
import JobsList from './components/JobsList';
import JobDetails from './components/JobDetails';
import DependencyGraph from './components/DependencyGraph';
import { getJobs, JobRecord } from './services/api';

export default function App() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getJobs();
      if (res.success && res.jobs) {
        setJobs(res.jobs);
      }
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleMigrationStarted = (jobId: string) => {
    setSelectedJobId(jobId);
    fetchJobs();
  };

  const selectedJob = jobs.find((j: JobRecord) => j.id === selectedJobId) || null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Banner */}
      <header className="bg-white border-b border-gray-150 py-5 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-150">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Code Migration Studio</h1>
              <p className="text-xs text-gray-400">AST & AI-powered project transformation</p>
            </div>
          </div>
          <button 
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & History List */}
          <div className="lg:col-span-5 space-y-8">
            <UploadZone onMigrationStarted={handleMigrationStarted} />
            <JobsList 
              jobs={jobs} 
              selectedJobId={selectedJobId} 
              onSelectJob={setSelectedJobId} 
            />
          </div>

          {/* Right Column: Selected Job Details & Files */}
          <div className="lg:col-span-7 space-y-8">
            <JobDetails job={selectedJob} />
            {selectedJob && selectedJob.status === 'completed' && (
              <DependencyGraph jobId={selectedJob.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
