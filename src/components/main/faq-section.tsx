'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What is SideEffect?",
    answer: "SideEffect is a cutting-edge platform that automatically generates engaging short-form content from your live streams. It uses advanced AI technology to identify key moments, ensuring you never miss an opportunity to create viral clips that resonate with your audience."
  },
  {
    question: "What platforms does SideEffect support?",
    answer: "SideEffect seamlessly integrates with all major streaming platforms including Twitch, YouTube, Facebook Gaming, and TikTok Live. We're constantly expanding our platform support to ensure creators have the flexibility they need."
  },
  {
    question: "How does SideEffect's AI identify key moments in my streams?",
    answer: "Our AI analyzes multiple factors including chat activity, audio levels, game events, and on-screen action to identify potentially viral moments. It uses machine learning algorithms trained on millions of successful clips to recognize patterns that typically generate high engagement."
  },
  {
    question: "Can I customize the length and style of the clips that SideEffect creates?",
    answer: "You can set your preferred clip duration (anywhere from 15 seconds to 3 minutes), choose aspect ratios (9:16, 16:9, 1:1), and even create custom templates with your branding. Our AI will adapt to your preferences while maintaining the engaging nature of the content."
  },
  {
    question: "Does SideEffect work in real-time?",
    answer: "Yes! SideEffect processes your stream in real-time, creating clips as events happen. This means you can have viral-worthy content ready to share within seconds of an exciting moment occurring in your stream."
  },
  {
    question: "Can I edit the clips before they are shared?",
    answer: "Yes, you have full control over your clips. While our AI creates optimized clips automatically, you can review and edit them using our built-in editor. Add captions, trim length, adjust audio, and more before sharing."
  },
  {
    question: "Where are my clips shared?",
    answer: "Your clips can be automatically shared to any connected platform including TikTok, YouTube Shorts, Instagram Reels, and Twitter. You can also download clips locally or store them in your SideEffect library for later use."
  },
  {
    question: "Can I add my own branding to the clips?",
    answer: "Yes! SideEffect offers comprehensive branding options. Add your logo, custom overlays, intros/outros, and watermarks. Premium users can create multiple branding presets for different types of content."
  },
  {
    question: "Does SideEffect offer analytics?",
    answer: "Yes, we provide detailed analytics for all your clips. Track views, engagement rates, audience retention, and more. Our analytics dashboard helps you understand what content resonates best with your audience across different platforms."
  },
  {
    question: "Is my data secure with SideEffect?",
    answer: "Absolutely. We use industry-standard encryption and security measures to protect your data. Your content is stored securely, and we never share your data with third parties without your explicit permission."
  }
]

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div>
      <button
        className="py-6 w-full flex justify-between items-center text-left"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-lg hel-font text-gray-900 dark:text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-12">
              <p className="text-gray-600 dark:text-gray-300 hel-font">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-9xl lg:text-[12rem] font-light italic text-black dark:text-white tracking-wide leading-none text-center mb-24 denton-condensed"
          >
            Questions? Answers.
          </motion.h2>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={index === openIndex}
                onClick={() => setOpenIndex(index === openIndex ? null : index)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
