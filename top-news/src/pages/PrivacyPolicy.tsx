"use client"
import { motion } from "framer-motion"
import SEOHead from "../components/layout/SEOHead"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
const PrivacyPolicy = () => {
  return (
    <>
    <Header></Header>
      <SEOHead
              title="Privacy Policy - Top News | Data Protection & User Privacy"
              description="Read Top News privacy policy covering user data collection, cookies, third-party services, and data usage. Learn how we protect your privacy and personal information."
              keywords="privacy policy, data protection, user privacy, cookies, personal information, GDPR compliance"
              canonicalUrl="https://topsnews.in/privacy-policy" ogTitle={undefined} ogDescription={undefined}      />

      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Privacy Policy</h1>
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
              <h2 className="text-2xl font-semibold text-red-primary mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Top News ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of
                your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website or use our services.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Name and contact information (email address, phone number)</li>
                <li>Demographic information (age, location, preferences)</li>
                <li>Account credentials and profile information</li>
                <li>Communication preferences and subscription settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you visit our website, we automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website and search terms used</li>
                <li>Operating system and device characteristics</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Providing and maintaining our news services</li>
                <li>Personalizing your experience and content recommendations</li>
                <li>Sending newsletters and important updates</li>
                <li>Responding to your inquiries and customer support requests</li>
                <li>Analyzing website usage and improving our services</li>
                <li>Preventing fraud and ensuring website security</li>
                <li>Complying with legal obligations and protecting our rights</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Types of Cookies</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Essential Cookies:</strong> Necessary for website functionality
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors use our site
                </li>
                <li>
                  <strong>Advertising Cookies:</strong> Used to deliver relevant advertisements
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings and preferences
                </li>
              </ul>

              <p className="text-gray-700 leading-relaxed">
                You can control cookie settings through your browser preferences. However, disabling certain cookies may
                affect website functionality.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">5. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may use third-party services that collect, monitor, and analyze user data:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Google Analytics:</strong> Website traffic analysis and reporting
                </li>
                <li>
                  <strong>Social Media Platforms:</strong> Social sharing and engagement features
                </li>
                <li>
                  <strong>Advertising Networks:</strong> Targeted advertising and remarketing
                </li>
                <li>
                  <strong>Email Service Providers:</strong> Newsletter delivery and management
                </li>
                <li>
                  <strong>Content Delivery Networks:</strong> Improved website performance
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                These third parties have their own privacy policies governing the use of your information.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">6. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>SSL encryption for data transmission</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response procedures</li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Access:</strong> Request access to your personal information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of processing
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section
                below.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If we become aware that we have collected personal information from
                a child under 13, we will take steps to delete such information promptly.
              </p>
            </motion.section>

            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable
                laws. We will notify you of any material changes by posting the updated policy on our website and
                updating the "Last updated" date. Your continued use of our services after such changes constitutes
                acceptance of the updated policy.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-red-primary mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> privacy@topsnews.in
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong>
                  <br />
                  Top News Privacy Officer
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

export default PrivacyPolicy
