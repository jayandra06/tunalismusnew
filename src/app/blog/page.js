import Link from 'next/link'
import Image from 'next/image'

const blogPosts = [
  {
    id: 'daily-habits-transform-language-skills',
    title: "5 Daily Habits That Will Transform Your Language Skills",
    excerpt: "Simple yet powerful daily routines that native speakers use to maintain fluency and continue growing their vocabulary.",
    category: "Learning Tips",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    author: "Sarah Johnson",
    date: "2024-01-15",
    featured: true
  },
  {
    id: 'cultural-context-grammar-rules',
    title: "Cultural Context: Why Grammar Rules Aren't Everything",
    excerpt: "Understanding the cultural nuances behind language use and how context shapes meaning in real conversations.",
    category: "Cultural Insights",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    author: "Maria Rodriguez",
    date: "2024-01-12",
    featured: false
  },
  {
    id: 'beginner-to-conversational-90-days',
    title: "From Beginner to Conversational in 90 Days",
    excerpt: "A structured approach to reaching conversational level quickly while building solid foundations for long-term success.",
    category: "Study Plans",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop",
    author: "David Chen",
    date: "2024-01-10",
    featured: true
  },
  {
    id: 'overcoming-language-learning-anxiety',
    title: "Overcoming Language Learning Anxiety: A Practical Guide",
    excerpt: "Learn how to build confidence and overcome the fear of making mistakes when speaking a new language.",
    category: "Psychology",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    author: "Emma Thompson",
    date: "2024-01-08",
    featured: false
  },
  {
    id: 'technology-language-learning-tools',
    title: "The Best Technology Tools for Language Learning in 2024",
    excerpt: "Discover the latest apps, platforms, and digital resources that can accelerate your language learning journey.",
    category: "Technology",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    author: "Alex Kumar",
    date: "2024-01-05",
    featured: false
  },
  {
    id: 'immersion-without-traveling',
    title: "Creating Language Immersion Without Traveling",
    excerpt: "Practical strategies to immerse yourself in a new language and culture from the comfort of your home.",
    category: "Immersion",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
    author: "Sophie Martin",
    date: "2024-01-03",
    featured: true
  }
]

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-[var(--color-soft-blue)]/10 text-[var(--color-muted-zinc)] dark:bg-blue-900/20 dark:text-zinc-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Learning Resources
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
            Language Learning Tips & Guides
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto text-lg md:text-xl">
            Discover proven strategies, cultural insights, and practical tips to accelerate your language learning journey.
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-8">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-zinc-700/50 transition-all duration-300 group cursor-pointer">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[var(--color-dusty-rose)] text-white px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3 group-hover:text-[var(--color-dusty-rose)] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{post.readTime}</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-8">
            All Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-zinc-700/50 transition-all duration-300 group cursor-pointer">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[var(--color-dusty-rose)] text-white px-3 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3 group-hover:text-[var(--color-dusty-rose)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

