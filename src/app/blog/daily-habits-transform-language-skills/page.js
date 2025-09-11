import Link from 'next/link'
import Image from 'next/image'

export default function DailyHabitsBlogPost() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/blog" className="text-[var(--color-dusty-rose)] hover:text-[var(--color-dusty-rose)]/80 transition-colors">
              ← Back to Blog
            </Link>
          </nav>

          {/* Article Header */}
          <div className="mb-12">
            <div className="mb-4">
              <span className="bg-[var(--color-dusty-rose)] text-white px-3 py-1 rounded-full text-sm font-medium">
                Learning Tips
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6">
              5 Daily Habits That Will Transform Your Language Skills
            </h1>
            <div className="flex items-center space-x-4 text-zinc-600 dark:text-zinc-300">
              <span>By Sarah Johnson</span>
              <span>•</span>
              <span>January 15, 2024</span>
              <span>•</span>
              <span>7 min read</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop"
              alt="Language learning daily habits"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
              <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
                Simple yet powerful daily routines that native speakers use to maintain fluency and continue growing their vocabulary. These habits aren't just about studying harder—they're about integrating language learning into your daily life in a way that feels natural and sustainable.
              </p>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                1. Morning Language Journaling
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Start your day by writing three sentences in your target language. It doesn't matter if they're simple or complex—what matters is consistency. Write about your dreams, your plans for the day, or how you're feeling. This habit serves multiple purposes:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Activates your language brain first thing in the morning</li>
                <li>Helps you identify vocabulary gaps naturally</li>
                <li>Builds confidence in expressing personal thoughts</li>
                <li>Creates a daily connection with the language</li>
              </ul>

              <div className="bg-[var(--color-soft-blue)]/10 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Pro Tip:
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Keep a small notebook by your bed. Even if you only write one sentence, you're building the habit. After a month, you'll be amazed at how naturally the words flow.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                2. The 15-Minute News Routine
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Instead of reading news in your native language, dedicate 15 minutes to news in your target language. This habit is incredibly powerful because:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>News vocabulary is practical and commonly used</li>
                <li>You already know the context, making comprehension easier</li>
                <li>It keeps you updated on current events in the target culture</li>
                <li>Builds reading speed and confidence</li>
              </ul>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                3. Kitchen Language Practice
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Cook one meal per week following a recipe in your target language. This multisensory approach combines:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Reading comprehension (recipe instructions)</li>
                <li>Vocabulary building (ingredients, cooking methods)</li>
                <li>Cultural learning (traditional dishes)</li>
                <li>Practical application (following directions)</li>
              </ul>

              <div className="bg-[var(--color-dusty-rose)]/10 dark:bg-[var(--color-dusty-rose)]/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Success Story:
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  "I learned more Spanish vocabulary in three months of cooking Mexican recipes than I did in a year of traditional classes. Plus, I can now make amazing tacos!" - Maria, Spanish learner
                </p>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                4. Evening Reflection in Target Language
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Before bed, spend 5 minutes thinking about your day in your target language. This mental exercise:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Reinforces vocabulary you used during the day</li>
                <li>Helps you identify areas where you need more words</li>
                <li>Creates emotional connections with the language</li>
                <li>Improves fluency through mental practice</li>
              </ul>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                5. Weekly Language Exchange
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Commit to one 30-minute conversation per week with a native speaker. This could be:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>An online language exchange partner</li>
                <li>A local conversation group</li>
                <li>A tutor or teacher</li>
                <li>A friend who speaks the language</li>
              </ul>

              <div className="bg-gradient-to-r from-[var(--color-dusty-rose)]/20 to-[var(--color-soft-blue)]/20 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                  The Compound Effect
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  These habits work together to create a comprehensive language learning ecosystem. Each habit reinforces the others, and together they create exponential growth in your language skills. The key is consistency—even 5 minutes daily is more powerful than 2 hours once a week.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Getting Started
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Don't try to implement all five habits at once. Start with one habit for a week, then add another. Within a month, you'll have a sustainable routine that transforms your language learning journey.
              </p>

              <div className="bg-white dark:bg-zinc-700 rounded-xl p-6 border-l-4 border-[var(--color-dusty-rose)]">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Your Next Step:
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Choose one habit from this list and commit to it for the next 7 days. Set a reminder on your phone, and don't worry about perfection—just focus on consistency.
                </p>
              </div>
            </div>
          </article>

          {/* Author Bio */}
          <div className="mt-16 bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                alt="Sarah Johnson"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                  Sarah Johnson
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Language Learning Specialist with 10+ years of experience helping students achieve fluency through practical, sustainable methods.
                </p>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-8">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link href="/blog/cultural-context-grammar-rules">
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=200&fit=crop"
                    alt="Cultural Context"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                      Cultural Context: Why Grammar Rules Aren't Everything
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                      Understanding the cultural nuances behind language use...
                    </p>
                  </div>
                </article>
              </Link>
              <Link href="/blog/beginner-to-conversational-90-days">
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop"
                    alt="90 Day Plan"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                      From Beginner to Conversational in 90 Days
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                      A structured approach to reaching conversational level...
                    </p>
                  </div>
                </article>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

