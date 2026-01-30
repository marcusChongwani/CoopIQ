import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";
import { Link } from "react-router-dom";
import { ArrowLeft, Film, Play, Mic, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const AdvertiseWithUs = () => {
  const offerings = [
    {
      icon: Film,
      title: "Sponsored documentary videos",
      description: "Full-length documentary content produced around your brand's story or initiative.",
    },
    {
      icon: Play,
      title: "Stand-alone video advertisements",
      description: "High-quality video ads designed for our engaged audience.",
    },
    {
      icon: Mic,
      title: "Brand mentions within videos",
      description: "Natural integrations within our regular content that feel authentic.",
    },
    {
      icon: Users,
      title: "Co-branded storytelling projects",
      description: "Collaborative projects that combine your brand with our storytelling expertise.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Advertise With Us"
        description="Partner with Depths of Zambia for video-based advertising and brand storytelling to reach an engaged, thoughtful audience."
        canonical="/advertise"
      />
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Advertise With Us" },
        ])}
      />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <motion.div 
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Advertise With Us
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Depths of Zambia works with brands and organizations through video-based partnerships built for an engaged, thoughtful audience.
          </p>
        </motion.div>

        {/* Offerings */}
        <motion.div 
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2 className="text-xl font-semibold mb-6" variants={fadeIn}>
            We offer:
          </motion.h2>
          <div className="grid gap-4">
            {offerings.map((offering, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                variants={fadeIn}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <offering.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{offering.title}</h3>
                  <p className="text-sm text-muted-foreground">{offering.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quality Statement */}
        <motion.div 
          className="rounded-2xl bg-muted/50 p-6 md:p-8 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="text-muted-foreground leading-relaxed">
            All video content is produced to a high standard and designed to fit naturally within our platform. We keep partnerships selective and aligned with our values, ensuring credibility for both the brand and the audience.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="rounded-2xl border border-border bg-card p-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h2 className="text-xl font-semibold mb-3">
            Interested in working together?
          </h2>
          <p className="text-muted-foreground mb-6">
            If your brand values meaningful storytelling and long-term impact, we're open to collaborating.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            For partnerships, rates, and media inquiries, contact us below.
          </p>
          <Link to="/contact">
            <Button size="lg" className="rounded-full gap-2">
              <Mail className="w-4 h-4" />
              Contact Us
            </Button>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AdvertiseWithUs;
