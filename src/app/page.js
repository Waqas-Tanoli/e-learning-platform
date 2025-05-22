import BecomeInstructor from "./Components/BecomeInstructor";
import CategoriesSection from "./Components/Categories";
import HeroSection from "./Components/HeroSection";
import InstructorSpotlight from "./Components/InstructorSpotlight";
import Newsletter from "./Components/NewsLetter";
import PopularCourses from "./Components/PopularCourses";
import Testimonials from "./Components/TestimonialSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <PopularCourses />
      <InstructorSpotlight />
      <Testimonials />
      <BecomeInstructor />
      <Newsletter />
    </div>
  );
}
