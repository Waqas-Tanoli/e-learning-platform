"use client";

import { motion } from "framer-motion";
import {
  FaPlay,
  FaSearch,
  FaStar,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 to-indigo-50 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-400 mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-indigo-400 mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
                Learn{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  without limits
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
                Start, switch, or advance your career with thousands of courses,
                professional certificates, and degrees from world-class
                instructors.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="What do you want to learn?"
                    className="w-full pl-5 pr-12 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                    <FaSearch className="text-lg" />
                  </button>
                </div>
                <button className="px-6 py-4 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md whitespace-nowrap">
                  Explore Courses
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    {[1, 2, 3].map((item) => (
                      <img
                        key={item}
                        src={`https://randomuser.me/api/portraits/${
                          item % 2 === 0 ? "women" : "men"
                        }/${item + 20}.jpg`}
                        alt="User"
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                  <span>100K+ Students</span>
                </div>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-yellow-400" />
                    ))}
                  </div>
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right content */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                  alt="Students learning"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>

                {/* Course card overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FaChalkboardTeacher className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Advanced Web Development
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        By Sarah Johnson
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaUserGraduate className="mr-1" />
                          <span>12,500 students</span>
                        </div>
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                          <FaPlay className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-purple-200/50 blur-xl z-0"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-indigo-200/50 blur-xl z-0"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
