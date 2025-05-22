"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function LearningPage(token, assignmentId) {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState("videos");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState({});
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const videoRefs = useRef({});
  const courseId = params?.courseId;

  // Check authentication and enrollment status
  useEffect(() => {
    const checkAuthAndEnrollment = async () => {
      const token = Cookies.get("token");
      const jwt = Cookies.get("jwt");

      if (!token || !jwt) {
        toast.error("Please login to access this course");
        router.push("/login");
        return;
      }

      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);

        // Check enrollment status
        const enrollmentRes = await fetch(
          `http://localhost:1337/api/enrolled-courses?filter[users_permissions_users][id][$eq]=${decodedUser.id}&filter[course][id][$eq]=${courseId}`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );

        if (!enrollmentRes.ok) {
          throw new Error("Failed to check enrollment status");
        }

        const enrollmentData = await enrollmentRes.json();
        const isUserEnrolled = enrollmentData.data.length > 0;
        setIsEnrolled(isUserEnrolled);

        if (!isUserEnrolled) {
          toast.error("You are not enrolled in this course");
          router.push("/courses");
          return;
        }

        // If authenticated and enrolled, fetch course data
        fetchCourseData();
      } catch (err) {
        console.error("Authentication error:", err);
        toast.error("Authentication failed");
        router.push("/login");
      }
    };

    if (courseId) {
      checkAuthAndEnrollment();
    } else {
      setError("Missing course ID");
      setIsLoading(false);
    }
  }, [courseId, router]);

  // Load video progress from cookies on initial render
  useEffect(() => {
    const savedProgress = Cookies.get(`course_${courseId}_progress`);
    if (savedProgress) {
      setVideoProgress(JSON.parse(savedProgress));
    }

    // Expand first lesson by default
    if (course?.videos?.length > 0) {
      setExpandedLessons((prev) => ({ ...prev, 1: true }));
      setActiveVideo(course.videos[0].id);
    }
  }, [courseId, course]);

  // Save video progress to cookies whenever it changes
  useEffect(() => {
    if (Object.keys(videoProgress).length > 0) {
      Cookies.set(
        `course_${courseId}_progress`,
        JSON.stringify(videoProgress),
        {
          expires: 30, // 30 days
        }
      );
    }
  }, [videoProgress, courseId]);

  // const fetchCourseData = async () => {
  //   try {
  //     const jwt = Cookies.get("jwt");
  //     const token = Cookies.get("token");
  //     let decodedUser = null;

  //     if (token) {
  //       try {
  //         decodedUser = jwtDecode(token);
  //         setUser(decodedUser);
  //       } catch (e) {
  //         console.error("Error decoding token:", e);
  //       }
  //     }

  //     // Fetch course data
  //     const res = await fetch(
  //       `http://localhost:1337/api/courses?filters[id][$eq]=${courseId}&populate=*`,
  //       {
  //         headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  //       }
  //     );

  //     if (!res.ok) throw new Error(`Failed to fetch course: ${res.status}`);

  //     const data = await res.json();
  //     console.log("Course data from API:", data);

  //     if (!data || data.data.length === 0) {
  //       throw new Error("Course not found");
  //     }

  //     const courseData = data.data[0];
  //     setCourse(courseData);

  //     // Fix submissions fetch - use proper Strapi v4 query format
  //     if (jwt && decodedUser?.id) {
  //       const submissionsRes = await fetch(
  //         `http://localhost:1337/api/submissions?filters[users_permissions_users][id][$eq]=${decodedUser.id}&filters[assignment][id][$eq]=${courseId}&populate=*`,
  //         {
  //           headers: { Authorization: `Bearer ${jwt}` },
  //         }
  //       );

  //       if (!submissionsRes.ok) {
  //         const errorData = await submissionsRes.json();
  //         console.error("Submissions Error:", errorData);
  //         throw new Error(
  //           `Failed to fetch submissions: ${submissionsRes.status}`
  //         );
  //       }

  //       const submissionsData = await submissionsRes.json();
  //       setUserSubmissions(submissionsData.data || []);
  //     }

  //     setIsLoading(false);
  //   } catch (err) {
  //     console.error("Error:", err);
  //     setError(err.message);
  //     setIsLoading(false);
  //   }
  // };

  const fetchCourseData = async () => {
    try {
      const jwt = Cookies.get("jwt");
      const token = Cookies.get("token");

      // Fetch course data
      const res = await fetch(
        `http://localhost:1337/api/courses?filters[id][$eq]=${courseId}&populate=*`,
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch course: ${res.status}`);

      const data = await res.json();
      console.log("Course data from API:", data);

      if (!data || data.data.length === 0) {
        throw new Error("Course not found");
      }

      const courseData = data.data[0];
      setCourse(courseData);

      // Fetch submissions if user exists
      if (user?.id) {
        const submissionsRes = await fetch(
          `http://localhost:1337/api/submissions?filters[users_permissions_users][id][$eq]=${user.id}&filters[assignment][id][$eq]=${courseId}&populate=*`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );

        if (!submissionsRes.ok) {
          const errorData = await submissionsRes.json();
          console.error("Submissions Error:", errorData);
          throw new Error(
            `Failed to fetch submissions: ${submissionsRes.status}`
          );
        }

        const submissionsData = await submissionsRes.json();
        setUserSubmissions(submissionsData.data || []);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  const handleFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };

  async function handleSubmitAssignment(assignmentId) {
    try {
      setIsSubmitting(true);
      const token = Cookies.get("token");
      const jwt = Cookies.get("jwt");
      const decodedUser = token ? jwtDecode(token) : null;

      if (!decodedUser?.id) {
        throw new Error("User not authenticated");
      }

      // First handle file upload if exists
      let fileId = null;
      if (submissionFile) {
        const fileFormData = new FormData();
        fileFormData.append("files", submissionFile);

        const fileUploadResponse = await fetch(
          "http://localhost:1337/api/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            body: fileFormData,
          }
        );

        if (!fileUploadResponse.ok) {
          throw new Error("File upload failed");
        }

        const fileData = await fileUploadResponse.json();
        fileId = fileData[0].id;
      }

      // Prepare the submission payload
      const submissionPayload = {
        data: {
          users_permissions_users: decodedUser.id,
          assignment: course.documentId,
          textSubmission: submissionText,
          submissionDate: new Date().toISOString(),
          //course: courseId,
          ...(fileId && { file: fileId }),
        },
      };

      // Submit the assignment data
      const submissionResponse = await fetch(
        "http://localhost:1337/api/submissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(submissionPayload),
        }
      );

      if (!submissionResponse.ok) {
        const errorData = await submissionResponse.json();
        throw new Error(errorData.error?.message || "Submission failed");
      }

      const data = await submissionResponse.json();
      toast.success("Assignment submitted successfully!");
      fetchCourseData(); // Refresh the data

      // Reset form
      setSubmissionText("");
      setSubmissionFile(null);

      return data;
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleVideoProgress = (videoId, currentTime, duration) => {
    const progressPercentage = (currentTime / duration) * 100;

    // Update local state
    setVideoProgress((prev) => ({
      ...prev,
      [videoId]: progressPercentage,
    }));

    // Calculate overall course progress
    const totalVideos = course.videos.length;
    const completedVideos = Object.values({
      ...videoProgress,
      [videoId]: progressPercentage,
    }).filter((p) => p >= 90).length;

    const newProgress = Math.round((completedVideos / totalVideos) * 100);
    setProgress(newProgress);
  };

  const toggleLesson = (lessonNumber) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonNumber]: !prev[lessonNumber],
    }));
  };

  const playVideo = (videoId) => {
    // Pause the current video if it's playing
    if (activeVideo && videoRefs.current[activeVideo]) {
      videoRefs.current[activeVideo].pause();
    }

    // Set the new active video
    setActiveVideo(videoId);

    // Scroll to the video player
    setTimeout(() => {
      const videoElement = document.getElementById(`video-${videoId}`);
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Play the new video after a short delay
      setTimeout(() => {
        if (videoRefs.current[videoId]) {
          videoRefs.current[videoId]
            .play()
            .catch((e) => console.log("Autoplay prevented:", e));
        }
      }, 100);
    }, 100);
  };
  useEffect(() => {
    if (course?.videos?.length > 0 && !activeVideo) {
      setActiveVideo(course.videos[0].id);
    }
  }, [course, activeVideo]);

  useEffect(() => {
    if (activeVideo && videoRefs.current[activeVideo]) {
      // Reset the video element when activeVideo changes
      const videoEl = videoRefs.current[activeVideo];
      videoEl.load(); // This reloads the video source

      // Attempt to play the video (may be blocked by browser autoplay policies)
      videoEl.play().catch((e) => {
        console.log("Autoplay prevented, user will need to click play:", e);
      });
    }
  }, [activeVideo]);
  const submitReview = async () => {
    try {
      const jwt = Cookies.get("jwt");
      const token = Cookies.get("token");
      const decodedUser = token ? jwtDecode(token) : null;

      if (!jwt || !decodedUser?.id) {
        toast.error("Please login to submit review");
        return;
      }

      const res = await fetch("http://localhost:1337/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            rating: review.rating,
            comment: review.comment,
            users_permissions_users: decodedUser.id,
            course: course.documentId,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      console.error("Review submission error:", err);
      toast.error(err.message);
    }
  };

  const generateCertificate = () => {
    try {
      const token = Cookies.get("jwtToken");
      const decodedUser = token ? jwtDecode(token) : null;

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add background color
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, 297, 210, "F");

      // Add border
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);

      // Add decorative elements
      doc.setFillColor(0, 102, 204);
      doc.circle(40, 40, 30, "F");
      doc.circle(257, 40, 30, "F");
      doc.circle(40, 170, 30, "F");
      doc.circle(257, 170, 30, "F");

      // Add certificate title
      doc.setFontSize(36);
      doc.setTextColor(0, 102, 204);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATE OF COMPLETION", 148.5, 40, { align: "center" });

      // Add decorative line
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(1);
      doc.line(60, 50, 237, 50);

      // Add "This is to certify that" text
      doc.setFontSize(18);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.text("This is to certify that", 148.5, 70, { align: "center" });

      // Add user name

      doc.setFontSize(28);
      doc.setTextColor(0, 102, 204);
      doc.setFont("helvetica", "bold");
      doc.text(decodedUser?.username || "Participant", 148.5, 90, {
        align: "center",
      });

      // Add "has successfully completed" text
      doc.setFontSize(18);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.text("has successfully completed", 148.5, 105, { align: "center" });

      // Add course title
      doc.setFontSize(24);
      doc.setTextColor(0, 102, 204);
      doc.setFont("helvetica", "bold");
      doc.text(course?.title || "the course", 148.5, 125, { align: "center" });

      // Add course details
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Course ID: ${course?.documentId || "N/A"}`, 148.5, 140, {
        align: "center",
      });

      // Add completion date
      const completionDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Completed on: ${completionDate}`, 148.5, 150, {
        align: "center",
      });

      // Add signature lines
      doc.setFontSize(12);
      doc.text("___________________________", 80, 180);
      doc.text("Instructor / Organization", 80, 185);
      doc.text("___________________________", 200, 180);
      doc.text("Date", 200, 185);

      // Add watermark
      doc.setFontSize(60);
      doc.setTextColor(230, 230, 230);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFIED", 148.5, 120, { align: "center", angle: 45 });

      // Generate filename
      const fileName = `Certificate_${course?.title.replace(/\s+/g, "_")}_${
        user?.username || "User"
      }.pdf`;

      // Save the PDF
      doc.save(fileName);

      toast.success("Certificate downloaded successfully!");
      setShowCertificate(false);
    } catch (error) {
      console.error("Certificate generation error:", error);
      toast.error("Failed to generate certificate");
    }
  };

  useEffect(() => {
    if (!courseId) {
      setError("Missing course ID");
      setIsLoading(false);
    } else {
      fetchCourseData();
    }
  }, [courseId]);

  // Calculate initial progress when videoProgress or course changes
  useEffect(() => {
    if (course?.videos) {
      const totalVideos = course.videos.length;
      const completedVideos = Object.values(videoProgress).filter(
        (p) => p >= 90
      ).length;
      const newProgress = Math.round((completedVideos / totalVideos) * 100);
      setProgress(newProgress);
    }
  }, [videoProgress, course]);

  if (isLoading)
    return <div className="text-center mt-10">Loading course content...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!course) return <div className="text-center mt-10">Course not found</div>;

  // Organize videos into lessons
  const lessons = {};
  course.videos?.forEach((video, index) => {
    const lessonNumber = Math.floor(index / 1) + 1;
    if (!lessons[lessonNumber]) {
      lessons[lessonNumber] = {
        title: `Lesson ${lessonNumber}`,
        videos: [],
        completed: false,
      };
    }
    lessons[lessonNumber].videos.push(video);

    // Check if lesson is completed (all videos >= 90% watched)
    const allVideosCompleted = lessons[lessonNumber].videos.every(
      (v) => videoProgress[v.id] >= 90
    );
    lessons[lessonNumber].completed = allVideosCompleted;
  });

  if (!isEnrolled) {
    return (
      <div className="text-center mt-10">Checking enrollment status...</div>
    );
  }

  if (isLoading)
    return <div className="text-center mt-10">Loading course content...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!course) return <div className="text-center mt-10">Course not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mt-20">
        {/* Course Info Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow">
          <div className="mb-6">
            {course.thumbnail?.url && (
              <img
                src={`http://localhost:1337${course.thumbnail.url}`}
                alt={course.title}
                className="w-full h-auto rounded-lg mb-4"
              />
            )}
            <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.shortDescription}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {course.difficultyLevel}
              </span>
              <span className="ml-2 text-gray-600">
                {course.students} students
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500">★ {course.rating}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setCurrentTab("videos")}
              className={`w-full text-left px-4 py-2 rounded ${
                currentTab === "videos"
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Videos ({course.videos?.length || 0})
            </button>
            {course.readings && course.readings.length > 0 && (
              <button
                onClick={() => setCurrentTab("readings")}
                className={`w-full text-left px-4 py-2 rounded ${
                  currentTab === "readings"
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                Readings ({course.readings.length})
              </button>
            )}
            {course.assignments && course.assignments.length > 0 && (
              <button
                onClick={() => setCurrentTab("assignments")}
                className={`w-full text-left px-4 py-2 rounded ${
                  currentTab === "assignments"
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                Assignments ({course.assignments.length})
              </button>
            )}
            <button
              onClick={() => setCurrentTab("review")}
              className={`w-full text-left px-4 py-2 rounded ${
                currentTab === "review"
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Leave Review
            </button>
          </div>

          {/* Certificate Section */}
          {progress === 100 && course.hasCertificate && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">
                Course Completed!
              </h3>
              <button
                onClick={generateCertificate}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download Certificate
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow">
          {currentTab === "videos" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Course Lessons</h2>

              {/* Video Player for Active Video */}
              {activeVideo && (
                <div className="mb-8" id={`video-${activeVideo}`}>
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                    <video
                      key={activeVideo}
                      ref={(el) => {
                        videoRefs.current[activeVideo] = el;
                      }}
                      controls
                      className="w-full"
                      onTimeUpdate={() => {
                        const videoEl = videoRefs.current[activeVideo];
                        if (videoEl) {
                          handleVideoProgress(
                            activeVideo,
                            videoEl.currentTime,
                            videoEl.duration
                          );
                        }
                      }}
                      autoPlay // Add autoPlay to start playing when changed
                    >
                      <source
                        src={`http://localhost:1337${
                          course.videos.find((v) => v.id === activeVideo)?.url
                        }`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-lg font-semibold">
                      {course.videos.find((v) => v.id === activeVideo)?.name}
                    </h3>
                    {course.videos.find((v) => v.id === activeVideo)
                      ?.caption && (
                      <p className="text-gray-600">
                        {
                          course.videos.find((v) => v.id === activeVideo)
                            ?.caption
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Lessons List */}
              <div className="space-y-4">
                {Object.entries(lessons).map(([lessonNumber, lesson]) => (
                  <div
                    key={lessonNumber}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className={`flex justify-between items-center p-4 cursor-pointer ${
                        expandedLessons[lessonNumber]
                          ? "bg-blue-50"
                          : "bg-white"
                      }`}
                      onClick={() => toggleLesson(lessonNumber)}
                    >
                      <div className="flex items-center">
                        <span className="font-semibold mr-3">
                          {lesson.title}
                        </span>
                        {lesson.completed && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          expandedLessons[lessonNumber] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {expandedLessons[lessonNumber] && (
                      <div className="p-4 border-t border-gray-200">
                        <ul className="space-y-2">
                          {lesson.videos.map((video) => (
                            <li
                              key={video.id}
                              className={`p-2 rounded flex items-center justify-between cursor-pointer ${
                                activeVideo === video.id
                                  ? "bg-blue-100"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                playVideo(video.id);
                                // Update URL for deep linking
                                window.history.pushState(
                                  null,
                                  "",
                                  `#video-${video.id}`
                                );
                              }}
                            >
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>{video.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">
                                  {Math.round(videoProgress[video.id] || 0)}%
                                </span>
                                {videoProgress[video.id] >= 90 ? (
                                  <span className="text-green-500">✓</span>
                                ) : (
                                  <span className="text-gray-400">○</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === "readings" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Course Readings</h2>
              {course.readings && course.readings.length > 0 ? (
                <div className="space-y-4">
                  {course.readings.map((reading, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <p className="text-gray-700">
                        {reading.children?.[0]?.text || "No content"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No readings available for this course.
                </p>
              )}
            </div>
          )}

          {currentTab === "assignments" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Course Assignments</h2>
              {course.assignments && course.assignments.length > 0 ? (
                <div className="space-y-6">
                  {course.assignments.map((assignment) => {
                    const userSubmission = userSubmissions.find(
                      (sub) =>
                        sub.attributes?.assignment?.data?.id === assignment.id
                    );

                    return (
                      <div
                        key={assignment.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {assignment.title}
                            </h3>
                            <p className="text-gray-600">
                              {assignment.description}
                            </p>
                            {assignment.dueDate && (
                              <p className="text-sm text-gray-500 mt-1">
                                Due:{" "}
                                {new Date(
                                  assignment.dueDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {assignment.url && (
                            <button
                              onClick={() =>
                                window.open(
                                  `http://localhost:1337${assignment.url}`,
                                  "_blank"
                                )
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition-all duration-300 text-sm md:text-base"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              <span>Download Assignment</span>
                            </button>
                          )}
                        </div>

                        {/* Submission Status */}
                        {userSubmission ? (
                          <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                            <h4 className="font-medium text-green-800 mb-1">
                              ✓ Submitted on{" "}
                              {new Date(
                                userSubmission.attributes.submissionDate
                              ).toLocaleDateString()}
                            </h4>
                            {userSubmission.attributes.textSubmission && (
                              <p className="text-gray-700 mb-2">
                                {userSubmission.attributes.textSubmission}
                              </p>
                            )}
                            {userSubmission.attributes.submissionFile?.data
                              ?.attributes?.url && (
                              <a
                                href={`http://localhost:1337${userSubmission.attributes.submissionFile.data.attributes.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:underline"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  ></path>
                                </svg>
                                View Submitted File
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium mb-3">
                              Submit Your Assignment
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  File Submission (PDF, DOC, ZIP)
                                </label>
                                <input
                                  type="file"
                                  onChange={handleFileChange}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Or Text Submission
                                </label>
                                <textarea
                                  value={submissionText}
                                  onChange={(e) =>
                                    setSubmissionText(e.target.value)
                                  }
                                  rows="4"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Type your submission here..."
                                ></textarea>
                              </div>
                              <button
                                onClick={() =>
                                  handleSubmitAssignment(assignment.id)
                                }
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting
                                  ? "Submitting..."
                                  : "Submit Assignment"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">
                  No assignments available for this course.
                </p>
              )}
            </div>
          )}

          {currentTab === "review" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
              <div className="max-w-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReview({ ...review, rating: star })}
                        className="text-2xl focus:outline-none"
                      >
                        {star <= review.rating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={review.comment}
                    onChange={(e) =>
                      setReview({ ...review, comment: e.target.value })
                    }
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your experience with this course..."
                  ></textarea>
                </div>
                <button
                  onClick={submitReview}
                  disabled={!review.comment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}

          {/* Certificate Modal */}
          {showCertificate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">
                    Course Completion Certificate
                  </h2>
                  <div className="border-2 border-blue-200 p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Awarded to: {user?.username || "User"}
                    </p>
                    <p className="text-gray-700">
                      Completed on: {new Date().toLocaleDateString()}
                    </p>
                    <div className="mt-6 flex justify-center">
                      <div className="border-t-2 border-blue-300 w-32 pt-2 text-blue-600">
                        Certificate ID:{" "}
                        {Math.random()
                          .toString(36)
                          .substring(2, 10)
                          .toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowCertificate(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Close
                    </button>
                    <button
                      onClick={generateCertificate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
