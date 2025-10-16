import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What is Hostelia?",
      answer:
        "Hostelia is a comprehensive hostel management system designed to streamline hostel operations and enhance the living experience for students. It provides easy access to all hostel services including room management, mess facilities, announcements, and more.",
    },
    {
      question: "How do I register on the platform?",
      answer:
        "Registration is simple and quick. Visit the Registration section, fill in your details including student ID, contact information, and upload necessary documents. Once verified by the administration, your account will be activated within 24-48 hours.",
    },
    {
      question: "Can I report maintenance issues through Hostelia?",
      answer:
        "Yes! Our Hostel Services section allows you to report any maintenance issues or problems with your room. Simply describe the issue, attach photos if needed, and submit. You can track the status of your complaint in real-time.",
    },
    {
      question: "How do I access the mess menu?",
      answer:
        "The daily mess menu is available in the Mess Management section. You can view the weekly menu schedule, provide feedback on meals, and even register dietary preferences or allergies for better meal planning.",
    },
    {
      question: "Are my payments secure on this platform?",
      answer:
        "Absolutely! We use bank-grade encryption and secure payment gateways to ensure all your transactions are completely safe. Your payment information is never stored on our servers and all transactions are encrypted end-to-end.",
    },
    {
      question: "How do I receive hostel announcements?",
      answer:
        "All hostel announcements are posted in the Announcements section and you receive instant notifications. You can also enable email and SMS alerts to never miss important updates about events, rule changes, or emergencies.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "The platform is fully responsive and works seamlessly on all mobile devices through your web browser. A dedicated mobile app for iOS and Android is currently in development and will be released soon.",
    },
    {
      question: "Who do I contact for technical support?",
      answer:
        "Our support team is available 24/7 to help you. You can reach us through the Contact section, send an email to support@hostelia.com, or use the in-app chat feature for instant assistance.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a90e2] to-[#357abd] mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 leading-relaxed">
            Got questions? We've got answers. Find everything you need to know
            about Hostelia.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "shadow-xl" : ""
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 md:px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg md:text-xl font-bold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-[#4a90e2]" />
                  </motion.div>
                </button>

                {/* Answer */}
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 md:px-8 pb-6 text-gray-600 leading-relaxed text-base md:text-lg">
                    {faq.answer}
                  </div>
                </motion.div>

                {/* Bottom Accent */}
                {openIndex === index && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-1 bg-gradient-to-r from-[#4a90e2] to-[#357abd] origin-left"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center bg-gradient-to-r from-[#4a90e2] to-[#357abd] rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-white/90 text-lg mb-6">
            Our support team is here to help you 24/7
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const element = document.querySelector("#contact");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-white text-[#4a90e2] rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
