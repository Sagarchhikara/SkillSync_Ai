import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Brain, Target, BarChart3, Upload, Cpu, Briefcase, Github, Mail, Info, ArrowRight, Zap, Shield, ChevronRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const features = [
  { icon: Brain, title: "AI Resume Analysis", desc: "Advanced NLP extracts and categorizes your skills, experience, and education automatically.", gradient: "from-primary to-accent" },
  { icon: Target, title: "Skill Matching Engine", desc: "Weighted algorithms match your profile against job requirements with precision.", gradient: "from-accent to-success" },
  { icon: BarChart3, title: "Compatibility Dashboard", desc: "Visual breakdown of your match score with actionable insights to improve.", gradient: "from-primary to-primary" },
];

const steps = [
  { icon: Upload, title: "Upload Resume", desc: "Drop your resume in any format and our system processes it instantly", num: "01" },
  { icon: Cpu, title: "AI Extracts Skills", desc: "Our engine parses, categorizes, and weights your skill profile", num: "02" },
  { icon: Briefcase, title: "Match With Jobs", desc: "Get scored against real positions with detailed breakdowns", num: "03" },
];

const stats = [
  { value: "95%", label: "Accuracy Rate" },
  { value: "50K+", label: "Resumes Analyzed" },
  { value: "10K+", label: "Jobs Matched" },
  { value: "<2s", label: "Analysis Time" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-16">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-1/4 left-1/3 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]"
        />

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              Powered by Advanced AI
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-8xl"
          >
            Turn Your Resume
            <br />
            Into{" "}
            <span className="relative">
              <span className="gradient-text">Opportunities</span>
              <motion.span
                className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Upload your resume and let SkillSync analyze your skills and match you with the most relevant jobs instantly.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="gradient" className="h-12 px-8 text-base" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" className="h-12 px-8 text-base" asChild>
              <Link to="/login">Login to Dashboard</Link>
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl px-4 py-5 text-center">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-32">
        {/* Section glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-20 text-center">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">Features</span>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">Intelligent Resume Matching</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">Three powerful engines working together to maximize your job search potential.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-primary-foreground shadow-lg`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>

                <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 py-32">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-20 text-center">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-accent">Process</span>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">How It Works</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">Three simple steps to find your perfect match.</p>
          </motion.div>

          <div className="grid gap-0 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="relative flex flex-col items-center px-8 py-8 text-center"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="absolute right-0 top-16 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-primary/40 via-accent/20 to-transparent md:block" />
                )}

                <div className="mb-2 text-4xl font-extrabold gradient-text opacity-30">{s.num}</div>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass text-primary">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-12 text-center md:p-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Ready to Find Your Match?</h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Join thousands of professionals using AI-powered resume matching to land their dream jobs.
            </p>
            <Button size="lg" variant="gradient" className="h-12 px-8 text-base" asChild>
              <Link to="/signup">
                Start Free Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">SkillSync AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="flex items-center gap-1.5 transition-colors hover:text-foreground"><Info className="h-4 w-4" /> About</a>
              <a href="#" className="flex items-center gap-1.5 transition-colors hover:text-foreground"><Github className="h-4 w-4" /> Github</a>
              <a href="#" className="flex items-center gap-1.5 transition-colors hover:text-foreground"><Mail className="h-4 w-4" /> Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} SkillSync AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
