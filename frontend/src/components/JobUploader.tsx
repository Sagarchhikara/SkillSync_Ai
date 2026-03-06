import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Upload, Server, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/services/api";

interface Job {
  _id: string;
  title: string;
  company: string;
  requiredSkills: string[];
  minExperience: number;
}

const JobUploader = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    requiredSkills: "",
    minExperience: "",
    description: "",
  });

  const fetchJobs = async () => {
    try {
      setFetching(true);
      const res = await api.get("/jobs");
      setJobs(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.requiredSkills) {
      toast.error("Please fill in required fields (Title, Company, Skills)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        minExperience: parseInt(formData.minExperience) || 0,
      };

      await api.post("/jobs", payload);
      toast.success("Job created successfully!");
      setFormData({ title: "", company: "", requiredSkills: "", minExperience: "", description: "" });
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDummyJobs = async () => {
    setLoading(true);
    try {
      await api.post("/jobs/seed");
      toast.success("Dummy jobs seeded successfully!");
      fetchJobs();
    } catch (err) {
      toast.error("Failed to seed dummy jobs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Job Form */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Create New Job
        </h3>
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                name="title"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company *</label>
              <Input
                name="company"
                placeholder="e.g. TechCorp Inc."
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Required Skills (comma-separated) *</label>
            <Input
              name="requiredSkills"
              placeholder="e.g. React, TypeScript, Node.js"
              value={formData.requiredSkills}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-medium">Min Experience (Years)</label>
              <Input
                name="minExperience"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={formData.minExperience}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              placeholder="Optional brief description of the role..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSeedDummyJobs}
              disabled={loading}
              className="gap-2 text-muted-foreground border-dashed"
            >
              <Server className="h-4 w-4" />
              Generate Dummy Jobs Instead
            </Button>
            <Button type="submit" variant="gradient" disabled={loading} className="gap-2">
              <Upload className="h-4 w-4" />
              {loading ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </div>

      {/* Available Jobs List */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
          Available Jobs
          <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {jobs.length} total
          </span>
        </h3>
        
        {fetching ? (
          <p className="text-sm text-muted-foreground">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No jobs found in the database.</p>
            <p className="text-sm text-muted-foreground mt-1">Create one above or click Generate Dummy Jobs.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">{job.title}</h4>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {job.minExperience}y+ exp
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{job.company}</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.slice(0, 5).map((skill) => (
                    <span key={skill} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 5 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      +{job.requiredSkills.length - 5} more
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobUploader;
