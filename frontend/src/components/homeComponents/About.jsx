import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Shield, Zap, Clock } from "lucide-react";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Users,
      title: "Student-Centric",
      description:
        "Built with students in mind, providing easy access to all hostel services and facilities.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Bank-grade security ensuring your data and transactions are always protected.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized performance for instant access to services, anytime, anywhere.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Round-the-clock access to manage your hostel life without any interruptions.",
      color: "from-green-500 to-teal-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="about"
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
            About Our Project
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a90e2] to-[#357abd] mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hostelia is a comprehensive hostel management system designed to
            bridge the gap between students and hostel administration. Our
            platform simplifies daily operations, enhances communication, and
            creates a better living experience for everyone.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#4a90e2] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className="mt-6 w-0 h-1 bg-gradient-to-r from-[#4a90e2] to-[#357abd] group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "1000+", label: "Active Students" },
            { value: "50+", label: "Hostel Rooms" },
            { value: "24/7", label: "Support" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#4a90e2] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
