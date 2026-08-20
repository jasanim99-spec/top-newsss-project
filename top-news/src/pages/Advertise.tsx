"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import SEOHead from "../components/layout/SEOHead"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
const Advertise = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })

  const handleChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Advertiser contact form submitted:", contactForm)
    alert("Thank you for your interest! Our advertising team will contact you within 24 hours.")
    setContactForm({ name: "", email: "", company: "", message: "" })
  }

  return (
    <>
      <Header></Header>
      <SEOHead
              title="Advertise With Us - Top News | Reach Millions of Engaged Readers"
              description="Advertise with Top News and reach millions of engaged readers worldwide. Explore our advertising opportunities including banner ads, sponsored content, and video advertising."
              keywords="advertise with live news, news advertising, banner ads, sponsored content, video ads, media advertising"
              canonicalUrl="https://topsnews.in/advertise" ogTitle={undefined} ogDescription={undefined}      />

      <div className="min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Advertise With Top News</h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Reach millions of engaged readers worldwide with our premium advertising solutions. Connect with your
              target audience through trusted, high-quality news content.
            </p>
          </motion.div>

          {/* Audience Reach Section */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Audience Reach</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { number: "5M+", label: "Monthly Readers" },
                { number: "2M+", label: "Daily Visitors" },
                { number: "150+", label: "Countries Reached" },
                { number: "85%", label: "Mobile Traffic" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 bg-white rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl font-bold text-red-primary mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Ad Formats Section */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Advertising Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Banner Advertising",
                  description: "High-visibility banner placements across our website with premium positioning options.",
                  features: ["Header banners", "Sidebar placements", "In-article ads", "Mobile-optimized"],
                  icon: "📱",
                },
                {
                  title: "Sponsored Articles",
                  description: "Native advertising that seamlessly integrates with our editorial content.",
                  features: [
                    "Editorial-style content",
                    "SEO optimized",
                    "Social media promotion",
                    "Analytics included",
                  ],
                  icon: "📝",
                },
                {
                  title: "Video Advertising",
                  description: "Engaging video content that captures attention and drives results.",
                  features: ["Pre-roll videos", "In-stream ads", "Video banners", "Interactive elements"],
                  icon: "🎥",
                },
              ].map((format, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="text-4xl mb-4">{format.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{format.title}</h3>
                  <p className="text-gray-600 mb-4">{format.description}</p>
                  <ul className="space-y-2">
                    {format.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <span className="text-red-primary mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Why Advertise Section */}
          <motion.section
            className="mb-16 bg-gray-50 p-8 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Top News?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-red-primary mb-4">Trusted Brand</h3>
                <p className="text-gray-700 leading-relaxed">
                  Top News is a trusted source for millions of readers worldwide. Your brand will be associated with
                  quality journalism and credible content.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-primary mb-4">Engaged Audience</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our readers are highly engaged, spending an average of 4+ minutes per visit and returning regularly
                  for the latest news updates.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-primary mb-4">Global Reach</h3>
                <p className="text-gray-700 leading-relaxed">
                  Reach audiences across 150+ countries with our international news coverage and multilingual content
                  options.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-primary mb-4">Performance Tracking</h3>
                <p className="text-gray-700 leading-relaxed">
                  Comprehensive analytics and reporting help you track campaign performance and optimize your
                  advertising investment.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact Form Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Ready to Get Started?</h2>
              <p className="text-gray-600 text-center mb-8">
                Contact our advertising team to discuss your campaign goals and get a custom quote.
              </p>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-primary focus:border-transparent transition-colors duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-primary focus:border-transparent transition-colors duration-200"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={contactForm.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-primary focus:border-transparent transition-colors duration-200"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-primary focus:border-transparent transition-colors duration-200 resize-vertical"
                    placeholder="Tell us about your advertising goals, budget, and preferred ad formats..."
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Request Advertising Information
                </motion.button>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default Advertise
