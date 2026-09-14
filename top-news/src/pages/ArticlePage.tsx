"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Eye, Facebook, Twitter, Linkedin } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { newsService } from "@/services/newsService"
import { mockArticles } from "@/data/mockNews"
import { safeFormatDistanceToNow } from "@/utils/converters"
import ReactMarkdown from "react-markdown"

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug || params.id || Object.values(params).filter(Boolean).pop()
  const navigate = useNavigate()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const incrementedRef = useRef<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchArticle = async () => {
      if (!slug) {
        setError("Invalid article URL")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const articleData = await newsService.getNewsBySlug(slug)
        if (articleData && (articleData.status === "published" || !articleData.status)) {
          setArticle(articleData)
          // Increment view count safely once per article ID
          if (articleData._id && incrementedRef.current !== articleData._id) {
            incrementedRef.current = articleData._id
            newsService.incrementNewsViews(articleData._id)
          }
        } else {
          // Fallback to mock data for dev testing if empty
          const mockArticle = mockArticles.find((a) => a.slug === slug)
          if (mockArticle) {
            setArticle(mockArticle)
          } else {
            setError("The article you're looking for doesn't exist.")
          }
        }
      } catch (err) {
        console.error("Error fetching article:", err)
        const mockArticle = mockArticles.find((a) => a.slug === slug)
        if (mockArticle) {
          setArticle(mockArticle)
        } else {
          setError("Failed to load article")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="news-container py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-muted rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="news-container py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
              <p className="text-muted-foreground mb-4">{error || "The article you're looking for doesn't exist."}</p>
              <Button onClick={() => navigate("/")}>Return to Home</Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const timeAgo = safeFormatDistanceToNow(article.publishedAt);
  const shareUrl = window.location.href

  return (
    <>
      <Helmet>
        <title>{article.title} - Top News</title>
        <meta name="description" content={article.description} />
        <meta name="keywords" content={article.keywords ? article.keywords.join(", ") : ""} />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={article.imageUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={article.imageUrl} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.description,
            image: article.imageUrl,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: {
              "@type": "Organization",
              name: "Top News",
            },
            publisher: {
              "@type": "Organization",
              name: "Top News",
              logo: {
                "@type": "ImageObject",
                url: "https://topsnews.in/logo.png",
              },
            },
            articleSection: article.category,
            keywords: article.keywords,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-3 lg:pt-4">
          <article className="news-container pb-8">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Article Content */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Category and Meta */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-4">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded uppercase tracking-wide">
                      {article.category}
                    </span>
                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground gap-x-2 gap-y-2">
                      {timeAgo && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{timeAgo}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{(article.views || 0).toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 font-serif">
                    {article.title}
                  </h1>

                  {/* Author Byline & Location */}
                  {((article as any).authorName || (article as any).location?.city) && (
                    <div className="flex items-center gap-3 mb-6 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                        {((article as any).authorName || 'R').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <span>{ (article as any).authorName || 'Field Reporter' }</span>
                          <span className="bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0.2 rounded border border-amber-500/30">
                            { (article as any).pressCardNo || 'Accredited Journalist' }
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          { (article as any).location?.city ? `Reported from ${(article as any).location.city}` : 'Top News Media Network' }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Key Bullets Box if available */}
                  {(article as any).aiSummary && (
                    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-2xl">
                      <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                        AI Quick Highlights (મુખ્ય અંશો):
                      </h4>
                      <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-purple-950 dark:text-purple-200 leading-relaxed">
                        {(article as any).aiSummary}
                      </pre>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xl text-muted-foreground leading-relaxed mb-8">{article.description}</p>

                  {/* Featured Image */}
                  {article.imageUrl && (
                    <div className="aspect-[16/9] relative overflow-hidden rounded-lg mb-8">
                      <img
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}

                  {/* Share Buttons */}
                  <div className="flex items-center space-x-2 mb-8 pb-8 border-b border-border">
                    <span className="text-sm font-medium mr-2">Share:</span>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-lg prose-p:leading-relaxed prose-strong:font-semibold prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-hr:border-border prose-hr:my-8">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mb-4 mt-8 text-foreground border-b border-border pb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">{children}</h3>
                        ),
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
                        hr: () => <hr className="border-border my-8" />,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 italic text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children, ...props }) => {
                          const isInline = !props.className?.includes("language-")
                          if (isInline) {
                            return (
                              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border">
                                {children}
                              </code>
                            )
                          }
                          return (
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border">
                              <code className="text-sm font-mono text-foreground">{children}</code>
                            </pre>
                          )
                        },
                        pre: ({ children }) => (
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border">{children}</pre>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6">
                            <table className="min-w-full border-collapse border border-border bg-background">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead>{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr>{children}</tr>,
                        th: ({ children }) => (
                          <th className="border border-border px-4 py-3 text-left font-semibold text-foreground bg-muted/30">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-4 py-3 text-foreground">{children}</td>
                        ),
                        img: ({ src, alt }) => (
                          <img
                            src={src || "/placeholder.svg"}
                            alt={alt || ""}
                            className="max-w-full h-auto rounded-lg my-4 border"
                          />
                        ),
                      }}
                    >
                      {(article.content || '').replace(/\\n/g, "\n")}
                    </ReactMarkdown>
                  </div>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h3 className="text-sm font-medium mb-3">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:flex-shrink-0"
              >
                <div className="lg:sticky lg:top-24">
                  <Sidebar />
                </div>
              </motion.div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  )
}
