import Link from 'next/link'

export default function OvercomingAnxietyBlogPost() {
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
                Psychology
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6">
              Overcoming Language Learning Anxiety: A Practical Guide
            </h1>
            <div className="flex items-center space-x-4 text-zinc-600 dark:text-zinc-300">
              <span>By Emma Thompson</span>
              <span>•</span>
              <span>January 8, 2024</span>
              <span>•</span>
              <span>8 min read</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop"
              alt="Overcoming language learning anxiety"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
              <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
                Learn how to build confidence and overcome the fear of making mistakes when speaking a new language. Language learning anxiety is real, but it doesn't have to hold you back from achieving your goals.
              </p>

              <div className="bg-gradient-to-r from-[var(--color-dusty-rose)]/20 to-[var(--color-soft-blue)]/20 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                  The Truth About Language Learning Anxiety
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Feeling anxious about speaking a new language is completely normal. Even native speakers feel nervous when they have to give presentations or speak in unfamiliar situations. The key is not to eliminate anxiety entirely, but to manage it effectively and use it as motivation rather than a barrier.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Understanding Your Anxiety
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Language learning anxiety typically stems from several common fears:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Fear of Making Mistakes
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Worrying about grammar errors, pronunciation mistakes, or using the wrong words.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Fear of Judgment
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Concern about what others will think of your language abilities.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Fear of Not Being Understood
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Worrying that you won't be able to communicate your thoughts clearly.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Fear of Embarrassment
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Anxiety about looking foolish or incompetent in front of others.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Reframing Your Mindset
              </h2>
              
              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Mistakes Are Learning Opportunities
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Every mistake you make is actually a valuable learning opportunity. When someone corrects you or you realize you've made an error, your brain is more likely to remember the correct version. Think of mistakes as stepping stones to fluency, not obstacles.
              </p>

              <div className="bg-[var(--color-soft-blue)]/10 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Success Story:
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  "I used to be terrified of speaking Spanish because I was afraid of making mistakes. Then I realized that every time I made a mistake, I learned something new. Now I actually look forward to being corrected because it means I'm improving!" - Jessica, Spanish learner
                </p>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Progress Over Perfection
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Focus on progress rather than perfection. Every conversation, no matter how imperfect, is a step forward. Native speakers don't expect you to be perfect—they're usually impressed that you're trying to learn their language.
              </p>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Practical Strategies for Building Confidence
              </h2>
              
              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                1. Start Small and Build Gradually
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Don't jump into complex conversations immediately. Start with simple, low-pressure situations:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Practice with language learning apps that don't judge</li>
                <li>Speak to yourself in the mirror</li>
                <li>Record yourself speaking and listen back</li>
                <li>Start with one-on-one conversations with patient partners</li>
                <li>Practice with children (they're usually more forgiving)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                2. Prepare for Common Situations
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Practice common phrases and scenarios until they feel natural:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Greetings and introductions</li>
                <li>Asking for directions</li>
                <li>Ordering food at restaurants</li>
                <li>Making small talk about weather, hobbies, or work</li>
                <li>Asking for help or clarification</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                3. Use the "Yes, and..." Technique
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                When you don't understand something, instead of panicking, use phrases like:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>"Could you repeat that, please?"</li>
                <li>"I'm sorry, I didn't catch that"</li>
                <li>"Could you speak a little slower?"</li>
                <li>"What does [word] mean?"</li>
                <li>"Could you explain that differently?"</li>
              </ul>

              <div className="bg-[var(--color-dusty-rose)]/10 dark:bg-[var(--color-dusty-rose)]/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Pro Tip:
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Native speakers actually appreciate when you ask for clarification. It shows you're engaged and want to understand, which is much better than pretending to understand and missing the point entirely.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                4. Create a Safe Learning Environment
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Find or create environments where you feel comfortable making mistakes:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Join language learning groups with other learners</li>
                <li>Find patient conversation partners who are also learning</li>
                <li>Use online platforms where you can practice anonymously</li>
                <li>Attend language exchange events in your area</li>
                <li>Work with tutors who specialize in building confidence</li>
              </ul>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Breathing and Relaxation Techniques
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                When you feel anxious before or during a conversation, these techniques can help:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    4-7-8 Breathing
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Inhale for 4 counts, hold for 7, exhale for 8. Repeat 3-4 times to calm your nervous system.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Grounding Technique
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Positive Affirmations
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Repeat: "I am learning and improving every day. Mistakes help me grow."
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                    Visualization
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Imagine yourself having a successful conversation before it happens.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Building a Support System
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Having the right support can make all the difference in overcoming anxiety:
              </p>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Find Your Language Learning Community
              </h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Join online forums and social media groups</li>
                <li>Attend local language meetups and events</li>
                <li>Connect with other learners at your level</li>
                <li>Share your struggles and successes with others</li>
                <li>Celebrate small victories together</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Work with Patient Native Speakers
              </h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Find conversation partners who are also learning languages</li>
                <li>Work with tutors who understand language learning anxiety</li>
                <li>Practice with people who are genuinely interested in helping</li>
                <li>Avoid people who are impatient or judgmental</li>
                <li>Remember that most native speakers are supportive</li>
              </ul>

              <div className="bg-gradient-to-r from-[var(--color-dusty-rose)]/20 to-[var(--color-soft-blue)]/20 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                  The Confidence Spiral
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Confidence in language learning works like a spiral: the more you practice, the more confident you become, which leads to more practice, which builds even more confidence. Start with small, manageable steps, and watch your confidence grow exponentially.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6 mt-12">
                Long-term Strategies for Sustained Confidence
              </h2>
              
              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Track Your Progress
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Keep a journal of your language learning journey:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Record conversations you've had successfully</li>
                <li>Note new words and phrases you've learned</li>
                <li>Celebrate milestones and breakthroughs</li>
                <li>Reflect on what's working and what isn't</li>
                <li>Set realistic goals and track your progress</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
                Embrace the Learning Process
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                Remember that language learning is a journey, not a destination:
              </p>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 mb-6 space-y-2">
                <li>Even native speakers are constantly learning</li>
                <li>Every expert was once a beginner</li>
                <li>Progress is more important than perfection</li>
                <li>Every conversation is a learning opportunity</li>
                <li>Confidence comes from practice, not perfection</li>
              </ul>

              <div className="bg-white dark:bg-zinc-700 rounded-xl p-6 border-l-4 border-[var(--color-dusty-rose)]">
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3">
                  Your Next Step:
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Choose one small, low-pressure way to practice speaking this week. It could be talking to yourself in the mirror, recording a short video, or having a simple conversation with a patient friend. Remember: every expert was once a beginner, and every conversation is a step forward.
                </p>
              </div>
            </div>
          </article>

          {/* Author Bio */}
          <div className="mt-16 bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                alt="Emma Thompson"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                  Emma Thompson
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Language Learning Psychologist and Confidence Coach. Specializes in helping learners overcome anxiety and build sustainable confidence in their language learning journey.
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
              <Link href="/blog/immersion-without-traveling">
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop"
                    alt="Immersion"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                      Creating Language Immersion Without Traveling
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                      Practical strategies to immerse yourself in a new language...
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

