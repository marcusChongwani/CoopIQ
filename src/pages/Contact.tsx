import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us"
        description="Get in touch with Depths of Zambia. We'd love to hear from you about collaborations, feedback, or questions."
        canonical="/contact"
      />
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact" },
        ])}
      />
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="mb-16 text-center space-y-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </motion.div>

        <motion.section
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        ><motion.section
        className="max-w-xl mx-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="">
          <h2 className="text-xl font-semibold tracking-tight">Message us</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            For the fastest reply, use WhatsApp. If you prefer email, that works too.
          </p>
      
          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="https://wa.me/message/GR7WX3OGSIXEF1"
              target="_blank"
              rel="noreferrer"
              className="
                rounded-2xl bg-primary text-white border border-border px-5 py-4
                hover:bg-primary/80 transition-colors
              "
            >
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs  mt-1">
                Quickest support & questions
              </p>
            </Link>
      
            <a
              href="mailto:depthsofzambia@gmail.com?subject=Hello%20Depths%20of%20Zambia"
              className="
                rounded-2xl bg-background border border-border px-5 py-4
                hover:bg-muted/50 transition-colors
              "
            >
              <p className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </p>
              <p className="text-xs text-muted-foreground mt-1">
              depthsofzambia@gmail.com
              </p>
            </a>
          </div>
      
          {/* What can we help with */}
          <div className="mt-8">
            <p className="text-sm font-semibold mb-3">What can we help with?</p>
      
            <div className="flex flex-wrap gap-2">
              {[
                "Collaboration",
                "Suggest a topic",
                "Report an issue",
                "Book purchase help",
                "General feedback",
              ].map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 rounded-full bg-muted/50 text-sm text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
      
          {/* Expectations */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Typical response time: <span className="text-foreground font-medium">within 24 hours</span>.
              Please don’t share sensitive payment info (PINs or passwords).
            </p>
          </div>
        </div>
      </motion.section>
      
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
