"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import SEOHead from "../components/layout/SEOHead"

const Sitemap = () => {
  const sitePages = [
    {
      category: "Main Pages",
      pages: [
        { title: "Home", path: "/", description: "Latest news and breaking stories" },
        { title: "About Us", path: "/about", description: "Learn about Top News mission and vision" },
        { title: "Contact", path: "/contact", description: "Get in touch with our editorial team" },
        { title: "Advertise", path: "/advertise", description: "Advertising opportunities and partnerships" },
      ],
    },
    {
      category: "Legal Pages",
      pages: [
        { title: "Privacy Policy", path: "/privacy", description: "How we protect your privacy and data" },
        { title: "Terms of Use", path: "/terms", description: "Website terms and conditions" },
        { title: "Sitemap", path: "/sitemap", description: "Complete list of all website pages" },
      ],
    },
  ]

  return (
    <>
      <SEOHead
              title="Sitemap - Top News | Complete Website Navigation"
              description="Browse the complete Top News sitemap with links to all pages including news sections, about us, contact, privacy policy, and terms of use."
              keywords="sitemap, website navigation, live news pages, site structure, website map"
              canonicalUrl="https://topsnews.in/sitemap" ogTitle={undefined} ogDescription={undefined}      />

      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Sitemap</h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Navigate through all pages and sections of Top News. Find exactly what you're looking for with our
              complete website directory.
            </p>
          </motion.div>

          <div className="space-y-12">
            {sitePages.map((section, sectionIndex) => (
              <motion.section
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-semibold text-red-primary mb-6 border-b-2 border-red-primary pb-2">
                  {section.category}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.pages.map((page, pageIndex) => (
                    <motion.div
                      key={page.path}
                      className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: sectionIndex * 0.2 + pageIndex * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <Link to={page.path} className="block">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-red-primary transition-colors duration-200">
                          {page.title}
                        </h3>
                        <p className="text-gray-600 mb-3 leading-relaxed">{page.description}</p>
                        <div className="flex items-center text-red-primary text-sm font-medium">
                          <span>Visit page</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Additional Information */}
          <motion.section
            className="mt-16 bg-gray-50 p-8 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Need Help Finding Something?</h2>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Can't find what you're looking for? Our team is here to help you navigate Top News and find the
              information you need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/contact" className="btn-primary">
                  Contact Support
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/about" className="btn-secondary">
                  Learn More About Us
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* SEO Information */}
          <motion.section
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Website Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-900">Total Pages:</strong>{" "}
                  {sitePages.reduce((total, section) => total + section.pages.length, 0)}
                </div>
                <div>
                  <strong className="text-gray-900">Last Updated:</strong> January 2024
                </div>
                <div>
                  <strong className="text-gray-900">Language:</strong> English
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}

export default Sitemap
