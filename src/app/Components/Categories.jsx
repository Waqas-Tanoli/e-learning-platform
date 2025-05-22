// components/CategoriesSection.js
import {
  FaCode,
  FaChartLine,
  FaPalette,
  FaMusic,
  FaCamera,
  FaFlask,
} from "react-icons/fa";

const CategoriesSection = () => {
  const categories = [
    {
      name: "Development",
      icon: <FaCode className="text-2xl" />,
      courses: "1,200",
    },
    {
      name: "Business",
      icon: <FaChartLine className="text-2xl" />,
      courses: "980",
    },
    {
      name: "Design",
      icon: <FaPalette className="text-2xl" />,
      courses: "750",
    },
    { name: "Music", icon: <FaMusic className="text-2xl" />, courses: "520" },
    {
      name: "Photography",
      icon: <FaCamera className="text-2xl" />,
      courses: "430",
    },
    { name: "Science", icon: <FaFlask className="text-2xl" />, courses: "380" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Top Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your perfect program in our top categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-xl p-6 text-center transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                {category.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">
                {category.courses} Courses
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="px-6 py-3 rounded-lg font-medium text-purple-600 border border-purple-600 hover:bg-purple-50 transition-colors">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
