import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy"
        description="Learn how Depths of Zambia collects, uses, and protects your personal information."
        canonical="/privacy"
        noIndex
      />
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Privacy Policy" },
        ])}
      />
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="mb-12 space-y-4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 2025
          </p>
        </motion.div>

        <motion.div
          className="prose prose-lg max-w-none space-y-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              At Depths of Zambia, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Purchase books or digital content</li>
              <li>Make donations to support our work</li>
              <li>Contact us through our contact form</li>
              <li>Subscribe to updates or newsletters</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              This information may include your name, email address, phone number, and payment information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-muted-foreground">
              When you visit our website, we may automatically collect certain information about your device, 
              including information about your web browser, IP address, time zone, and some of the cookies 
              installed on your device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Process purchases and deliver digital content</li>
              <li>Process donations and send receipts</li>
              <li>Respond to your comments and questions</li>
              <li>Improve our website and content</li>
              <li>Analyze usage patterns and trends</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Payment Processing</h2>
            <p className="text-muted-foreground">
              We use secure third-party payment processors to handle all transactions. We do not store 
              your complete payment information on our servers. All payment data is encrypted and 
              processed in accordance with industry security standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your 
              personal information. However, please note that no method of transmission over the Internet 
              or method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>The right to access your personal information</li>
              <li>The right to rectification of inaccurate information</li>
              <li>The right to erasure of your personal information</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through our 
              contact page or reach out via our official channels.
            </p>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
