import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { Sparkles, Zap, Palette, BookOpen, Users, Download } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "AI Story Generation",
    description: "Generate compelling plot outlines, chapter summaries, and dialogue using advanced AI",
  },
  {
    icon: Users,
    title: "Character Management",
    description: "Create and manage reusable character profiles with AI-generated descriptions",
  },
  {
    icon: Palette,
    title: "Artwork Studio",
    description: "Generate stunning manhwa-style artwork from text prompts in multiple styles",
  },
  {
    icon: Zap,
    title: "Drag-and-Drop Editor",
    description: "Arrange panels, add speech bubbles, and compose complete webtoon chapters",
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Export your work as PNG, PDF, ZIP archives, or individual panels",
  },
  {
    icon: Sparkles,
    title: "Professional Workspace",
    description: "A refined, intuitive platform designed for creative professionals",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ManhwaForge AI
            </span>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            variants={itemVariants}
          >
            Create Your Own{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Manhwa Series
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed"
            variants={itemVariants}
          >
            An AI-powered platform that empowers creators to produce original webtoons and manhwa series
            with professional-grade tools and intelligent assistance.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
            >
              Start Creating Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 hover:bg-slate-800 text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-300">
              Everything you need to bring your creative vision to life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-8 hover:border-purple-400 transition-colors"
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Icon className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Create?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join creators worldwide using ManhwaForge AI to bring their stories to life
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-400">
        <p>&copy; 2026 ManhwaForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
