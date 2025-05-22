// components/InstructorSpotlight.js
import { FaChalkboardTeacher, FaStar } from "react-icons/fa";

const InstructorSpotlight = () => {
  const instructors = [
    {
      id: 1,
      name: "Alex Rodriguez",
      specialty: "Web Development",
      rating: 4.95,
      students: 45000,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Alex Rodriguez",
      specialty: "Web Development",
      rating: 4.95,
      students: 45000,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      specialty: "Web Development",
      rating: 4.95,
      students: 45000,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Instructors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn from the best industry experts and educators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border-4 border-purple-100">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {instructor.name}
              </h3>
              <p className="text-purple-600 mb-3">{instructor.specialty}</p>

              <div className="flex items-center justify-center mb-3">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-700">{instructor.rating}</span>
              </div>

              <p className="text-gray-600 mb-4">
                <span className="font-semibold">
                  {instructor.students.toLocaleString()}
                </span>{" "}
                students
              </p>

              <button className="px-4 py-2 rounded-lg font-medium text-purple-600 border border-purple-600 hover:bg-purple-50 transition-colors">
                View Courses
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorSpotlight;
