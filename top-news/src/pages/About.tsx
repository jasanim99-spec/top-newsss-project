"use client"
import { motion } from "framer-motion"
import  SEOHead  from "../components/layout/SEOHead"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

const About = () => {
  return (
    <>
      <Header></Header>
      <SEOHead
        title="About Us - Top News | Our Mission, Vision & Commitment"
        description="Learn about Top News - our mission to deliver real-time, accurate, and unbiased news coverage. Discover our vision and commitment to quality journalism."
        keywords="about live news, news mission, journalism ethics, news vision, media company"
        canonicalUrl="https://topsnews.in/about" ogTitle={undefined} ogDescription={undefined}      />

      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">About Top News</h1>

            <div className="prose prose-lg max-w-none">
              <motion.section
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-semibold text-red-primary mb-4">Our Story</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Top News was founded with a simple yet powerful mission: to provide real-time, accurate, and unbiased
                  news coverage to readers around the world. In an era where information travels at the speed of light,
                  we understand the critical importance of delivering trustworthy journalism that helps people make
                  informed decisions.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Since our inception, we have been committed to upholding the highest standards of journalistic
                  integrity, ensuring that every story we publish is thoroughly researched, fact-checked, and presented
                  without bias or agenda.
                </p>
              </motion.section>

              <motion.section
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-semibold text-red-primary mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our mission is to democratize access to reliable news and information by providing comprehensive
                  coverage of local, national, and international events. We strive to bridge the gap between complex
                  global issues and everyday understanding, making news accessible to everyone regardless of their
                  background or location.
                </p>
              </motion.section>

              <motion.section
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-semibold text-red-primary mb-4">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed">
                  We envision a world where every individual has access to accurate, timely, and unbiased information
                  that empowers them to participate meaningfully in democratic processes and make informed decisions
                  about their lives and communities. Through our commitment to excellence in journalism, we aim to be
                  the most trusted news source globally.
                </p>
              </motion.section>

              <motion.section
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-semibold text-red-primary mb-4">Our Commitment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Accuracy First</h3>
                    <p className="text-gray-700">
                      Every story undergoes rigorous fact-checking and verification before publication.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Unbiased Reporting</h3>
                    <p className="text-gray-700">
                      We present facts objectively, allowing readers to form their own opinions.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-Time Updates</h3>
                    <p className="text-gray-700">Breaking news and developments are reported as they happen, 24/7.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Global Perspective</h3>
                    <p className="text-gray-700">
                      Comprehensive coverage of events from around the world with local context.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-semibold text-red-primary mb-4">Editorial Standards</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Top News adheres to the highest editorial standards in the industry. Our team of experienced
                  journalists and editors work tirelessly to ensure that every piece of content meets our strict
                  criteria for accuracy, fairness, and relevance.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to transparency in our reporting process and welcome feedback from our readers. If
                  you have concerns about any of our content, please don't hesitate to reach out to our editorial team.
                </p>
              </motion.section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer></Footer>
    </>
  )
}

export default About
