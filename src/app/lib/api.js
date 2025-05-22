export default async function getCourseById(courseId) {
  try {
    const fallbackRes = await fetch(
      `http://localhost:1337/api/courses?filters[id][$eq]=${courseId}&populate=*`
    );

    if (!fallbackRes.ok) {
      throw new Error(`Failed to fetch course: ${fallbackRes.status}`);
    }

    const data = await fallbackRes.json();
    return data.data[0] || null;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

// export async function getCourseById(courseId) {

//   const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

//   try {
//     // Build query string based on your content types
//     const query = [
//       "populate[thumbnail]=true",
//       "populate[previewVideo]=true",
//       "populate[videos]=true",
//       "populate[assignments]=true",
//     ].join("&");

//     const res = await fetch(`${apiUrl}/api/courses/${courseId}?populate=*`, {
//       cache: "no-store",
//       headers: {
//         Authorization: `Bearer ${process.env.STRAPI_API_TOKEN || ""}`,
//         "Content-Type": "application/json",
//       },
//     });

//     console.log(`Fetching course from: ${res.url}`);

//     if (!res.ok) {
//       const errorData = await res.json().catch(() => ({}));
//       throw new Error(
//         `Failed to fetch course: ${res.status} - ${
//           errorData.error?.message || res.statusText
//         }`
//       );
//     }

//     const response = await res.json();

//     if (!response.data) {
//       throw new Error("Invalid course data structure");
//     }

//     // Transform response based on your content types
//     return {
//       id: response.data.id,
//       title: response.data.attributes.title,
//       category: response.data.attributes.category,
//       difficulty: response.data.attributes.DifficultyLevel,
//       level: response.data.attributes.Level,
//       slug: response.data.attributes.slug,
//       description: response.data.attributes.Description,
//       shortDescription: response.data.attributes.shortDescription,
//       price: response.data.attributes.price,
//       discountedPrice: response.data.attributes.discountedPrice,
//       students: response.data.attributes.students,
//       rating: response.data.attributes.rating,
//       durationHours: response.data.attributes.durationHours,
//       language: response.data.attributes.language,
//       isFree: response.data.attributes.isFree,
//       hasCertificate: response.data.attributes.hasCertificate,
//       instructor: response.data.attributes.InstructorName,
//       thumbnail: response.data.attributes.thumbnail?.data?.attributes?.url
//         ? `${apiUrl}${response.data.attributes.thumbnail.data.attributes.url}`
//         : "/placeholder-course.jpg",
//       previewVideo: response.data.attributes.previewVideo?.data?.attributes?.url
//         ? `${apiUrl}${response.data.attributes.previewVideo.data.attributes.url}`
//         : null,
//       videos:
//         response.data.attributes.videos?.data?.map((video) => ({
//           id: video.id,
//           url: `${apiUrl}${video.attributes.url}`,
//           name: video.attributes.name,
//         })) || [],
//       assignments:
//         response.data.attributes.assignments?.data?.map((assignment) => ({
//           id: assignment.id,
//           url: `${apiUrl}${assignment.attributes.url}`,
//           name: assignment.attributes.name,
//         })) || [],
//       createdAt: response.data.attributes.createdAt,
//       updatedAt: response.data.attributes.updatedAt,
//     };
//   } catch (error) {
//     console.error(`Failed to fetch course ${courseId}:`, error.message);
//     throw error;
//   }
// }

// export async function getAllCourseIds() {
//   const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

//   try {
//     const res = await fetch(`${apiUrl}/api/courses?fields[0]=id`);

//     if (!res.ok) {
//       throw new Error(
//         `Failed to fetch courses: ${res.status} ${res.statusText}`
//       );
//     }

//     const { data } = await res.json();

//     return data.map((item) => ({
//       id: item.id.toString(),
//     }));
//   } catch (error) {
//     console.error("Error fetching course IDs:", error.message);
//     return [];
//   }
// }
