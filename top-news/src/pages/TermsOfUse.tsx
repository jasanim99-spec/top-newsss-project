"use client"
import { motion } from "framer-motion"
import SEOHead from "../components/layout/SEOHead"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
const TermsOfUse = () => {
  return (
    <>
    <Header></Header>
      <SEOHead
              title="Terms of Use - Top News | Website Terms & Conditions"
              description="Read Top News terms of use covering content usage, user restrictions, disclaimers, and liability. Understand your rights and responsibilities when using our website."
              keywords="terms of use, terms and conditions, website terms, user agreement, content usage, legal disclaimer"
              canonicalUrl="https://topsnews.in/terms-of-use" ogTitle={undefined} ogDescription={undefined}      />

      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Terms of Use</h1>
            <p className="text-lg text-gray-600 text-center mb-8">Last updated: January 1, 2024</p>
          </motion.div>

          <div className="prose prose-lg max-w-none">
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Top News website ("Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service. These Terms of Use constitute a legally binding agreement between you and Top News.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Top News provides online news and information services, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Breaking news and current events coverage</li>
                <li>Editorial content and opinion pieces</li>
                <li>Multimedia content including images and videos</li>
                <li>Newsletter subscriptions and alerts</li>
                <li>Interactive features and user engagement tools</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without
                prior notice.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">3. User Conduct and Restrictions</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not
                to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Transmit or post any content that is unlawful, harmful, or offensive</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Reproduce, duplicate, or copy any part of the Service for commercial purposes</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">4. Intellectual Property Rights</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Our Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Top News website, including but not limited to text, graphics, logos, images, audio
                clips, video clips, and software, is the property of Top News or its content suppliers and is protected
                by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Limited License</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We grant you a limited, non-exclusive, non-transferable license to access and use the Service for
                personal, non-commercial purposes. This license does not include:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Resale or commercial use of the Service or its contents</li>
                <li>Collection and use of product listings or descriptions</li>
                <li>Making derivative uses of the Service and its contents</li>
                <li>Use of data mining, robots, or similar data gathering tools</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">5. User-Generated Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you submit, post, or transmit any content to the Service ("User Content"), you:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Retain ownership of your User Content</li>
                <li>Grant us a worldwide, royalty-free license to use, reproduce, and distribute your content</li>
                <li>Represent that you have all necessary rights to the content</li>
                <li>Agree that your content does not violate any third-party rights</li>
                <li>Acknowledge that we may remove any content at our discretion</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">6. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                Service, to understand our practices regarding the collection and use of your personal information. By
                using the Service, you consent to the collection and use of your information as outlined in our Privacy
                Policy.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">7. Disclaimers</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Content Accuracy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                While we strive to provide accurate and up-to-date information, we make no representations or warranties
                about the completeness, accuracy, reliability, or suitability of the information contained on the
                Service. Any reliance you place on such information is strictly at your own risk.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not guarantee that the Service will be available at all times or that it will be free from errors,
                viruses, or other harmful components. We reserve the right to modify, suspend, or discontinue the
                Service at any time.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Third-Party Content</h3>
              <p className="text-gray-700 leading-relaxed">
                The Service may contain links to third-party websites or content. We are not responsible for the
                content, accuracy, or opinions expressed on such websites, and such websites are not investigated,
                monitored, or checked for accuracy by us.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the fullest extent permitted by applicable law, Top News shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses
                resulting from:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of our servers and/or personal information</li>
                <li>Any interruption or cessation of transmission to or from the Service</li>
                <li>Any bugs, viruses, or similar harmful code transmitted through the Service</li>
                <li>Any errors or omissions in any content or for any loss or damage incurred</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">9. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Top News and its officers, directors, employees, and
                agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or
                fees arising out of or relating to your violation of these Terms or your use of the Service.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your access to the Service immediately, without prior notice or liability,
                for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your
                right to use the Service will cease immediately.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the State of New York, without regard to
                its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall
                be resolved in the courts of New York.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                try to provide at least 30 days notice prior to any new terms taking effect. Your continued use of the
                Service after such changes constitutes acceptance of the new Terms.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> legal@topsnews.in
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong>
                  <br />
                  Top News Legal Department
                  <br />
                  123 News Street
                  <br />
                  Media City, NY 10001
                  <br />
                  United States
                </p>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  )
}

export default TermsOfUse
