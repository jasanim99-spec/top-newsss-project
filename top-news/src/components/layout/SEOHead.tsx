"use client"

import { useEffect } from "react"

const SEOHead = ({ title, description, keywords, ogTitle, ogDescription, ogImage = "/og-image.jpg", canonicalUrl }) => {
  useEffect(() => {
    // Set title
    document.title = title

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute("content", description)
    } else {
      const meta = document.createElement("meta")
      meta.name = "description"
      meta.content = description
      document.head.appendChild(meta)
    }

    // Set keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywords)
      } else {
        const meta = document.createElement("meta")
        meta.name = "keywords"
        meta.content = keywords
        document.head.appendChild(meta)
      }
    }

    // Set Open Graph tags
    const setOGTag = (property, content) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`)
      if (ogTag) {
        ogTag.setAttribute("content", content)
      } else {
        ogTag = document.createElement("meta")
        ogTag.setAttribute("property", property)
        ogTag.setAttribute("content", content)
        document.head.appendChild(ogTag)
      }
    }

    setOGTag("og:title", ogTitle || title)
    setOGTag("og:description", ogDescription || description)
    setOGTag("og:image", ogImage)
    setOGTag("og:type", "website")

    if (canonicalUrl) {
      setOGTag("og:url", canonicalUrl)

      // Set canonical URL
      let canonical = document.querySelector('link[rel="canonical"]')
      if (canonical) {
        canonical.setAttribute("href", canonicalUrl)
      } else {
        canonical = document.createElement("link")
        canonical.setAttribute("rel", "canonical")
        canonical.setAttribute("href", canonicalUrl)
        document.head.appendChild(canonical)
      }
    }

    // Set Twitter Card tags
    const setTwitterTag = (name, content) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`)
      if (twitterTag) {
        twitterTag.setAttribute("content", content)
      } else {
        twitterTag = document.createElement("meta")
        twitterTag.setAttribute("name", name)
        twitterTag.setAttribute("content", content)
        document.head.appendChild(twitterTag)
      }
    }

    setTwitterTag("twitter:card", "summary_large_image")
    setTwitterTag("twitter:title", ogTitle || title)
    setTwitterTag("twitter:description", ogDescription || description)
    setTwitterTag("twitter:image", ogImage)
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl])

  return null
}

export default SEOHead
