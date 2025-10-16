import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Home, Utensils, Megaphone, UserPlus, ArrowRight } from "lucide-react";

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Home,
      title: "Hostel Services",
      description:
        "Report and track room issues, maintenance requests, and facility problems with ease.",
      route: "/services/problems",
      gradient: "from-blue-500 to-cyan-500",
      bgPattern: "bg-blue-50",
    },
    {
      icon: Utensils,
      title: "Mess Management",
      description:
        "View daily menus, provide feedback, and manage your meal preferences effortlessly.",
      route: "/services/mess",
      gradient: "from-orange-500 to-red-500",
      bgPattern: "bg-orange-50",
    },
    {
      icon: Megaphone,
      title: "Announcements",
      description:
        "Stay updated with real-time hostel announcements, events, and important notices.",
      route: "/services/announcements",
      gradient: "from-purple-500 to-pink-500",
      bgPattern: "bg-purple-50",
    },
    {
      icon: UserPlus,
      title: "Registration",
      description:
        "Quick and hassle-free hostel registration process with digital documentation.",
      route: "/services/register",
      gradient: "from-green-500 to-teal-500",
      bgPattern: "bg-green-50",
    },
  ];

  const handleServiceClick = (route) => {
    // In a real app, this would navigate to the route
    console.log(`Navigate to: ${route}`);
  };

  return (
    <section id="services" className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a90e2] to-[#357abd] mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need for a smooth hostel experience, all in one
            place.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              onClick={() => handleServiceClick(service.route)}
              className="group cursor-pointer"
            >
              <div
                className={`${service.bgPattern} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#4a90e2] h-full relative overflow-hidden`}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/50 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <service.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#4a90e2] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center text-[#4a90e2] font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>

                {/* Bottom Accent */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-[#4a90e2] to-[#357abd] rounded-2xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to experience seamless hostel management?
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of students already using Hostelia for a better
              hostel life.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-[#4a90e2] rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
