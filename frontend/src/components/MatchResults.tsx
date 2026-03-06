import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScoreCard from "@/components/ScoreCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface SkillBreakdown {
  name: string;
  weight: number;
  matched: boolean;
}

interface MatchData {
  skillMatch: number;
  experienceMatch: number;
  finalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  weightsSummary: {
    totalWeight: number;
    matchedWeight: number;
    skillBreakdown: SkillBreakdown[];
  };
}

const MatchResults = () => {
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MatchData | null>(null);

  const handleMatch = async () => {
    if (!resumeId || !jobId) {
      toast.error("Please enter both Resume ID and Job ID");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/match/${resumeId}/${jobId}`);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Match failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Resume ID</Label>
            <Input placeholder="e.g. 69a7b2ee4f66914d06b847bb" value={resumeId} onChange={(e) => setResumeId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Job ID</Label>
            <Input placeholder="e.g. 7849c9f2aa123456" value={jobId} onChange={(e) => setJobId(e.target.value)} />
          </div>
        </div>
        <Button variant="gradient" onClick={handleMatch} disabled={loading}>
          {loading ? <LoadingSpinner size={16} /> : <><Search className="mr-2 h-4 w-4" /> Analyze Match</>}
        </Button>
      </div>

      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="glass rounded-2xl p-6 flex justify-center">
                <ScoreCard score={data.finalScore} label="Final Score" size={140} />
              </div>
              <div className="glass rounded-2xl p-6 flex justify-center">
                <ScoreCard score={data.skillMatch} label="Skill Match" size={120} />
              </div>
              <div className="glass rounded-2xl p-6 flex justify-center">
                <ScoreCard score={data.experienceMatch} label="Experience" size={120} />
              </div>
            </div>

            {/* Skills */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass rounded-2xl p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.matchedSkills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.missingSkills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive">
                      <XCircle className="h-3 w-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Weight Breakdown Table */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Weight Breakdown</h3>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Skill</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Weight</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weightsSummary.skillBreakdown.map((s) => (
                      <tr key={s.name} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.weight}</td>
                        <td className="px-4 py-3">
                          {s.matched ? (
                            <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> Yes</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchResults;
