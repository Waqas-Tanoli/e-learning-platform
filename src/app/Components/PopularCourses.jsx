// components/PopularCourses.js
import { FaStar, FaUserGraduate, FaPlayCircle } from "react-icons/fa";

const PopularCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Advanced Web Development",
      instructor: "Sarah Johnson",
      rating: 4.9,
      students: 12500,
      price: 89.99,
      discountedPrice: 59.99,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Development",
    },
    {
      id: 2,
      title: "Advanced Web Development",
      instructor: "Sarah Johnson",
      rating: 4.9,
      students: 12500,
      price: 89.99,
      discountedPrice: 59.99,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Development",
    },
    {
      id: 3,
      title: "Advanced Web Development",
      instructor: "Sarah Johnson",
      rating: 4.9,
      students: 12500,
      price: 89.99,
      discountedPrice: 59.99,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Development",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Most Popular Courses
            </h2>
            <p className="text-lg text-gray-600">
              Pick from our most popular courses
            </p>
          </div>
          <button className="mt-4 md:mt-0 px-6 py-3 rounded-lg font-medium text-purple-600 border border-purple-600 hover:bg-purple-50 transition-colors">
            View All Courses
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  {course.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {course.title}
                  </h3>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">By {course.instructor}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaUserGraduate className="mr-1" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center">
                    {course.discountedPrice && (
                      <span className="text-gray-400 line-through mr-2">
                        ${course.price}
                      </span>
                    )}
                    <span className="font-bold text-purple-600">
                      ${course.discountedPrice || course.price}
                    </span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center transition-colors">
                  <FaPlayCircle className="mr-2" />
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
