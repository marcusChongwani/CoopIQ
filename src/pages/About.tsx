import { motion } from "framer-motion";
import Header from "@/components/Header";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="mb-16 text-center space-y-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            About Depths of Zambia
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            An explainer video platform focused on adding context to Zambian stories.
          </p>
        </motion.div>

        {/* What We Do Section */}
        <motion.section
          className="mb-16 space-y-6 text-muted-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-lg leading-relaxed">
            We create research-driven explainer videos that break down complex topics using animation, 
            archival material, and visual storytelling. The goal is simple: help people understand what's 
            really happening, why it matters, and how it connects.
          </p>
          <p className="leading-relaxed">
            Too much information today is loud but shallow. Depths of Zambia exists to slow things down 
            and make sense of the details that often get missed. We focus on clarity over speed and 
            understanding over hype.
          </p>
          <p className="leading-relaxed">
            The platform is independently run and guided by research and editorial judgment. We don't chase 
            trends or quick takes. Every video is built to inform, not just attract attention.
          </p>
          <p className="leading-relaxed">
            As Depths of Zambia grows, the format and scale will evolve. But the mission stays the same: 
            clear explanations, honest context, and stories that actually make sense.
          </p>
        </motion.section>

        {/* What We Explain Section */}
        <motion.section
          className="mb-16 rounded-2xl bg-card p-8 md:p-12"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6">What We Explain</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Depths of Zambia produces explainer videos that unpack the issues shaping life in Zambia, including:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-primary">•</span>
                <span>The economy and public finance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-primary">•</span>
                <span>Business and markets</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-primary">•</span>
                <span>Personal finance and money habits</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-primary">•</span>
                <span>History and unresolved national moments</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-primary">•</span>
                <span>Social issues affecting everyday life</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1 text-primary">•</span>
                <span>Politics and governance</span>
              </li>
            </ul>
            <p className="pt-4">
              We use research, animation, archival material, and clear visuals to explain complex topics 
              in a way that is accessible, grounded, and easy to follow.
            </p>
            <p className="font-medium text-foreground">
              The goal is not noise or opinion — it is understanding.
            </p>
          </div>
        </motion.section>

        {/* Our Approach Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-8">Our Approach</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Research-Driven</h3>
              <p className="text-muted-foreground">
                Every video is built on careful research, not quick takes or trending opinions.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Visual Storytelling</h3>
              <p className="text-muted-foreground">
                We use animation and archival material to make complex topics accessible.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Editorial Independence</h3>
              <p className="text-muted-foreground">
                We are independently run and guided by editorial judgment, not external pressure.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Clarity First</h3>
              <p className="text-muted-foreground">
                We prioritize understanding over hype, depth over speed.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;
