import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service"
        description="Read the terms and conditions for using Depths of Zambia's website and services."
        canonical="/terms"
        noIndex
      />
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Terms of Service" },
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
            Terms of Service
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
            <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Depths of Zambia's website and services, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily access the materials on Depths of Zambia's website for personal, 
              non-commercial viewing only. Under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to decompile or reverse engineer any software on our website</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Digital Products</h2>
            <p className="text-muted-foreground">
              When you purchase digital products (such as ebooks) from Depths of Zambia, you receive a personal, 
              non-transferable license to access and use the content. You may not redistribute, resell, or share 
              purchased digital products with others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Donations</h2>
            <p className="text-muted-foreground">
              Donations made to Depths of Zambia are voluntary contributions to support our work. Donations are 
              non-refundable and do not constitute payment for goods or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on Depths of Zambia, including videos, articles, images, logos, and designs, is the property of 
              Depths of Zambia or its content creators and is protected by international copyright laws. 
              Unauthorized use of our content may violate copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
            <p className="text-muted-foreground">
              The materials on Depths of Zambia's website are provided on an "as is" basis. Depths of Zambia makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties including, 
              without limitation, implied warranties or conditions of merchantability, fitness for a particular 
              purpose, or non-infringement of intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitations of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall Depths of Zambia or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising out of 
              the use or inability to use the materials on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Modifications</h2>
            <p className="text-muted-foreground">
              Depths of Zambia may revise these Terms of Service at any time without notice. By using this website, 
              you are agreeing to be bound by the current version of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with the laws of Zambia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through our contact page.
            </p>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
