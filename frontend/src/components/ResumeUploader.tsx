import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface UploadResult {
  _id: string;
  userId: string;
  skills: string[];
  education: string[];
  createdAt: string;
}

interface ResumeUploaderProps {
  onUploadSuccess?: (data: UploadResult) => void;
}

const ResumeUploader = ({ onUploadSuccess }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const { user, refreshUser } = useAuth();

  const handleUpload = async () => {
    if (!file) return;
    if (!user) {
      toast.error("You must be logged in to upload a resume.");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", user._id);
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
      onUploadSuccess?.(res.data.data);
      
      // Refresh user data to get persisted skills
      await refreshUser();
      
      toast.success("Resume uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
            whileHover={{ scale: 1.01 }}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Drop your resume here or click to browse</p>
              <p className="mt-1 text-sm text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </motion.div>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between rounded-xl glass p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="gradient" onClick={handleUpload} disabled={loading}>
                    {loading ? <LoadingSpinner size={16} /> : "Upload"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Resume processed successfully</span>
          </div>
          <div className="glass rounded-xl p-6 space-y-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resume ID</span>
              <p className="mt-1 font-mono text-sm text-foreground">{result._id}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Extracted Skills</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Uploaded {new Date(result.createdAt).toLocaleString()}
            </div>
          </div>
          <Button variant="glass" onClick={() => { setResult(null); setFile(null); }}>Upload Another</Button>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeUploader;
