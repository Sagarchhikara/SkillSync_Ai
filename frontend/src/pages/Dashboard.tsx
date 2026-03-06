import { Routes, Route, Navigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import ResumeUploader from "@/components/ResumeUploader";
import MatchResults from "@/components/MatchResults";
import JobUploader from "@/components/JobUploader";
import { motion } from "framer-motion";
import { Bell, User, FileText, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DashboardHome = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      <p className="text-sm text-muted-foreground">Welcome back. Here's your overview.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { icon: FileText, label: "Resumes Uploaded", value: "3", color: "text-primary" },
        { icon: Target, label: "Jobs Matched", value: "12", color: "text-accent" },
        { icon: TrendingUp, label: "Avg Match Score", value: "85%", color: "text-success" },
      ].map((stat) => (
        <div key={stat.label} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Upload</h3>
        <ResumeUploader />
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Match</h3>
        <MatchResults />
      </div>
    </div>
  </motion.div>
);

const UploadPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Upload Resume</h2>
      <p className="text-sm text-muted-foreground">Upload your resume for AI analysis.</p>
    </div>
    <div className="glass rounded-2xl p-8">
      <ResumeUploader />
    </div>
  </motion.div>
);

const MatchPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Job Matching</h2>
      <p className="text-sm text-muted-foreground">Check your compatibility score against any job.</p>
    </div>
    <MatchResults />
  </motion.div>
);

const JobsPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Jobs Management</h2>
      <p className="text-sm text-muted-foreground">Create new jobs or browse available positions.</p>
    </div>
    <JobUploader />
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-end gap-4 border-b border-border px-6">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="match" element={<MatchPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
