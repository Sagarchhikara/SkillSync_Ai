import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BookmarkCheck, Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface SavedJob {
  _id: string;
  title: string;
  company: string;
  minExperience: number;
}

const SavedJobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const { user } = useAuth();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSavedJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/${user._id}/jobs`);
      setJobs(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId: string) => {
    if (!user) return;
    setRemovingId(jobId);
    try {
      await api.delete(`/users/${user._id}/jobs/${jobId}`);
      setJobs(jobs.filter((j) => j._id !== jobId));
      toast.success("Job removed successfully");
    } catch (err: any) {
      toast.error("Failed to remove job");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
           <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-primary" /> Your Saved Jobs
            </h3>
           <p className="text-sm text-muted-foreground">Manage the jobs you've bookmarked for later.</p>
        </div>
      </div>

      <AnimatePresence>
        {jobs.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border-accent/30">
             <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
             <p className="text-muted-foreground">You haven't saved any jobs yet.</p>
             <p className="text-sm text-muted-foreground mt-1">Go to the Job Matching tab to find and save opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {jobs.map((job, index) => (
                <motion.div
                   key={job._id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ delay: index * 0.05 }}
                   className="glass rounded-xl p-5 relative group flex flex-col justify-between h-full"
                >
                   <div>
                       <h4 className="font-bold text-foreground leading-tight mb-1">{job.title}</h4>
                       <p className="text-sm text-muted-foreground">{job.company}</p>
                       <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                           {job.minExperience}+ yrs exp required
                       </p>
                   </div>
                   
                   <div className="mt-6 flex justify-end">
                       <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemove(job._id)}
                          disabled={removingId === job._id}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                       >
                           {removingId === job._id ? <LoadingSpinner size={14} /> : <><Trash2 className="h-4 w-4 mr-2" /> Remove</>}
                       </Button>
                   </div>
                </motion.div>
             ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedJobs;
