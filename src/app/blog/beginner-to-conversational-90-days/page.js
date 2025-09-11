import Link from 'next/link'

export default function BeginnerToConversationalBlogPost() {
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
                Study Plans
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6">
              From Beginner to Conversational in 90 Days
            </h1>
            <div className="flex items-center space-x-4 text-zinc-600 dark:text-zinc-300">
              <span>By David Chen</span>
              <span>•</span>
              <span>January 10, 2024</span>
              <span>•</span>
              <span>10 min read</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop"
              alt="90 day language learning plan"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
              <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
                A structured approach to reaching conversational level quickly while building solid foundations for long-term success. This isn't about shortcuts—it's about focused, efficient learning that gets you speaking confidently in real-world situations.
              </p>

              <div className="bg-gradient-to-r from-[var(--color-dusty-rose)]/20 to-[var(--color-soft-blue)]/20 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                  What "Conversational" Really Means
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  By the end of 90 days, you should be able to handle basic daily conversations, ask for directions, order food, make small talk, and express your opinions on familiar topics. You won't be fluent, but you'll be functional and confident.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                The 90-Day Framework
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                This plan is divided into three 30-day phases, each building on the previous one:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6 border-l-4 border-[var(--color-dusty-rose)]">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Days 1-30: Foundation
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Build core vocabulary, learn essential grammar, and start speaking from day one.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6 border-l-4 border-[var(--color-soft-blue)]">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Days 31-60: Expansion
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Expand vocabulary, practice real conversations, and build confidence.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Days 61-90: Fluency
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Focus on natural conversation, cultural nuances, and real-world practice.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Phase 1: Foundation (Days 1-30)
              </h2>
              
              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Week 1-2: Essential Vocabulary
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Focus on the 200 most common words that make up 80% of daily conversation:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Personal pronouns (I, you, he, she, we, they)</li>
                <li>Basic verbs (be, have, do, go, come, see, know, want, like)</li>
                <li>Common nouns (time, person, year, way, day, thing, man, woman, child)</li>
                <li>Essential adjectives (good, bad, big, small, new, old, hot, cold)</li>
                <li>Question words (what, where, when, why, how, who)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Week 3-4: Basic Grammar
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Learn just enough grammar to start forming sentences:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Present tense of essential verbs</li>
                <li>Basic sentence structure (Subject + Verb + Object)</li>
                <li>Yes/No questions and basic question formation</li>
                <li>Simple negation (not, don't, can't)</li>
                <li>Basic prepositions (in, on, at, with, for)</li>
              </ul>

              <div className="bg-[var(--color-soft-blue)]/10 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Daily Routine (Phase 1):
                </h3>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 space-y-2">
                  <li>30 minutes: Vocabulary learning (10 new words)</li>
                  <li>20 minutes: Grammar practice</li>
                  <li>15 minutes: Speaking practice (even if just to yourself)</li>
                  <li>10 minutes: Listening to simple audio</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Phase 2: Expansion (Days 31-60)
              </h2>
              
              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Week 5-6: Practical Vocabulary
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Add vocabulary for real-world situations:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Food and dining (restaurant, menu, order, pay, delicious)</li>
                <li>Shopping (store, buy, price, size, color, try on)</li>
                <li>Transportation (bus, train, ticket, station, direction)</li>
                <li>Accommodation (hotel, room, reservation, check-in)</li>
                <li>Emergency situations (help, police, hospital, problem)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Week 7-8: Conversation Skills
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Start having real conversations:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Find a language exchange partner or tutor</li>
                <li>Practice common conversation starters</li>
                <li>Learn how to ask for clarification</li>
                <li>Practice expressing opinions and preferences</li>
                <li>Learn common phrases for social situations</li>
              </ul>

              <div className="bg-[var(--color-dusty-rose)]/10 dark:bg-[var(--color-dusty-rose)]/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Daily Routine (Phase 2):
                </h3>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 space-y-2">
                  <li>25 minutes: Vocabulary expansion (5-7 new words)</li>
                  <li>20 minutes: Conversation practice</li>
                  <li>15 minutes: Listening to native speakers</li>
                  <li>15 minutes: Reading simple texts</li>
                  <li>5 minutes: Review and reflection</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Phase 3: Fluency (Days 61-90)
              </h2>
              
              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Week 9-10: Natural Conversation
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Focus on speaking naturally and understanding cultural context:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Learn common idioms and expressions</li>
                <li>Practice storytelling and describing experiences</li>
                <li>Work on pronunciation and intonation</li>
                <li>Learn to handle misunderstandings gracefully</li>
                <li>Practice different conversation styles (formal vs. informal)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Week 11-12: Real-World Application
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Put your skills to the test in real situations:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Have conversations with native speakers</li>
                <li>Watch movies or TV shows without subtitles</li>
                <li>Read articles or books in your target language</li>
                <li>Join online communities or forums</li>
                <li>Practice in real-world scenarios (restaurants, shops, etc.)</li>
              </ul>

              <div className="bg-green-500/10 dark:bg-green-500/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Daily Routine (Phase 3):
                </h3>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 space-y-2">
                  <li>30 minutes: Real conversation practice</li>
                  <li>20 minutes: Listening to native content</li>
                  <li>15 minutes: Reading practice</li>
                  <li>10 minutes: Vocabulary review</li>
                  <li>5 minutes: Goal setting and reflection</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Essential Tools and Resources
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Here are the tools you'll need for each phase:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Phase 1 Tools
                  </h3>
                  <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 text-sm space-y-1">
                    <li>Flashcard app (Anki, Quizlet)</li>
                    <li>Basic grammar book or online course</li>
                    <li>Simple audio lessons</li>
                    <li>Language learning app (Duolingo, Babbel)</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Phase 2 Tools
                  </h3>
                  <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 text-sm space-y-1">
                    <li>Language exchange platform (HelloTalk, Tandem)</li>
                    <li>Online tutor or conversation partner</li>
                    <li>Simple podcasts or YouTube channels</li>
                    <li>Basic reading materials</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Phase 3 Tools
                  </h3>
                  <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 text-sm space-y-1">
                    <li>Native content (movies, TV, books)</li>
                    <li>Advanced conversation partners</li>
                    <li>Language meetups or events</li>
                    <li>Real-world practice opportunities</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Throughout All Phases
                  </h3>
                  <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 text-sm space-y-1">
                    <li>Progress tracking system</li>
                    <li>Goal-setting framework</li>
                    <li>Motivation and accountability system</li>
                    <li>Regular review and adjustment</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Common Pitfalls to Avoid
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Here are the most common mistakes that derail 90-day plans:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li><strong>Perfectionism:</strong> Don't wait until you're perfect to start speaking</li>
                <li><strong>Overwhelming yourself:</strong> Stick to the daily time limits</li>
                <li><strong>Neglecting speaking:</strong> Practice speaking from day one</li>
                <li><strong>Ignoring cultural context:</strong> Learn how the language is actually used</li>
                <li><strong>Not tracking progress:</strong> Keep records of what you've learned</li>
                <li><strong>Giving up too early:</strong> The first month is the hardest</li>
              </ul>

              <div className="bg-gradient-to-r from-[var(--color-dusty-rose)]/20 to-[var(--color-soft-blue)]/20 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                  Success Metrics
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  By day 90, you should be able to:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 space-y-2">
                  <li>Handle basic daily conversations confidently</li>
                  <li>Ask for and understand directions</li>
                  <li>Order food and make purchases</li>
                  <li>Express opinions on familiar topics</li>
                  <li>Understand the main points of simple conversations</li>
                  <li>Make small talk with native speakers</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Beyond 90 Days
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                After 90 days, you'll have a solid foundation for continued learning. The next phase focuses on:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Expanding vocabulary to 2,000+ words</li>
                <li>Learning more complex grammar structures</li>
                <li>Improving pronunciation and accent</li>
                <li>Understanding cultural nuances and idioms</li>
                <li>Building confidence in professional settings</li>
                <li>Developing reading and writing skills</li>
              </ul>

              <div className="bg-white dark:bg-zinc-700 rounded-xl p-6 border-l-4 border-[var(--color-dusty-rose)]">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Ready to Start?
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  The key to success is consistency and realistic expectations. You won't be fluent in 90 days, but you'll be conversational and confident. That's a huge achievement that will open doors to deeper learning and real-world connections.
                </p>
              </div>
            </div>
          </article>

          {/* Author Bio */}
          <div className="mt-16 bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="David Chen"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                  David Chen
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Language Learning Strategist and founder of RapidLanguage.com. Specializes in accelerated learning methods and has helped over 10,000 students achieve conversational fluency.
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
              <Link href="/blog/daily-habits-transform-language-skills">
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
                    alt="Daily Habits"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                      5 Daily Habits That Will Transform Your Language Skills
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                      Simple yet powerful daily routines that native speakers use...
                    </p>
                  </div>
                </article>
              </Link>
              <Link href="/blog/overcoming-language-learning-anxiety">
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop"
                    alt="Overcoming Anxiety"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                      Overcoming Language Learning Anxiety
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                      Learn how to build confidence and overcome the fear...
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

