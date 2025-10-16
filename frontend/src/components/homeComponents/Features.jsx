import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MessageSquare, CreditCard, Mail, AlertCircle } from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [flippedCard, setFlippedCard] = useState(null);

  const features = [
    {
      icon: MessageSquare,
      title: "Real-Time Chatroom",
      frontDesc: "Instant Communication",
      backDesc:
        "Connect with fellow students and hostel staff instantly. Share updates, ask questions, and build a community through our integrated chat system.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      frontDesc: "Safe & Encrypted",
      backDesc:
        "Make hostel fee payments, mess charges, and other transactions with complete peace of mind. Bank-grade encryption ensures your financial data is always protected.",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: Mail,
      title: "Direct Email System",
      frontDesc: "Professional Communication",
      backDesc:
        "Send official communications directly to hostel administration. Get formal responses and maintain a professional record of all correspondence.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: AlertCircle,
      title: "Complaint Tracking",
      frontDesc: "Real-Time Status Updates",
      backDesc:
        "Submit complaints and track their resolution in real-time. Receive notifications at every step and ensure your concerns are addressed promptly.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-b from-white to-gray-50"
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Standout Features
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a90e2] to-[#357abd] mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the powerful features that make Hostelia the preferred
            choice for modern hostel management.
          </p>
        </motion.div>

        {/* Features Grid with Flip Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="h-80"
            >
              <div
                className="relative w-full h-full cursor-pointer preserve-3d"
                style={{
                  transformStyle: "preserve-3d",
                  transition: "transform 0.6s",
                  transform:
                    flippedCard === index ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
                onClick={() =>
                  setFlippedCard(flippedCard === index ? null : index)
                }
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 backface-hidden rounded-3xl shadow-xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div
                    className={`h-full bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 flex flex-col items-center justify-center text-white relative overflow-hidden`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full -ml-20 -mb-20" />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="relative z-10 mb-6"
                    >
                      <feature.icon className="w-20 h-20" />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-3 text-center relative z-10">
                      {feature.title}
                    </h3>
                    <p className="text-white/90 text-center relative z-10 mb-4">
                      {feature.frontDesc}
                    </p>

                    <div className="mt-auto text-sm text-white/70 relative z-10">
                      Click to learn more
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 backface-hidden rounded-3xl shadow-xl"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="h-full bg-white rounded-3xl p-8 flex flex-col justify-center border-2 border-gray-100">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.backDesc}
                    </p>

                    <div className="mt-auto text-sm text-gray-400">
                      Click to flip back
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-gray-500 text-sm md:hidden"
        >
          Tap cards to flip and learn more
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
