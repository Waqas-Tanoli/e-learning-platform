// components/BecomeInstructor.js
import { FaChalkboardTeacher } from "react-icons/fa";

const BecomeInstructor = () => {
  return (
    <section className="py-16 bg-purple-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <FaChalkboardTeacher className="text-2xl mr-2" />
              <span className="font-semibold">FOR INSTRUCTORS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Become an Instructor Today
            </h2>
            <p className="text-lg text-purple-100 max-w-2xl">
              Join our world-class instructor community and share your knowledge
              with millions of students worldwide.
            </p>
          </div>

          <button className="px-8 py-4 rounded-lg font-bold bg-white text-purple-600 hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap">
            Start Teaching Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default BecomeInstructor;
