// components/Testimonials.js
import { FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote:
        "This platform transformed my career. The courses are comprehensive and the instructors are top-notch.",
      name: "Emily Chen",
      role: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      quote:
        "This platform transformed my career. The courses are comprehensive and the instructors are top-notch.",
      name: "Emily Chen",
      role: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      quote:
        "This platform transformed my career. The courses are comprehensive and the instructors are top-notch.",
      name: "Emily Chen",
      role: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our global community of learners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-purple-400 mb-4">
                <FaQuoteLeft className="text-3xl" />
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>

              <div className="flex items-center">
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
