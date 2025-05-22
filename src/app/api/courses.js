//  // If user is logged in, fetch user and check enrollment
//  if (jwt) {
//     const userRes = await fetch(
//       "http://localhost:1337/api/users/me?populate=*",
//       {
//         headers: { Authorization: `Bearer ${jwt}` },
//       }
//     );

//     if (!userRes.ok) throw new Error("Failed to fetch user");
//     const userData = await userRes.json();
//     setUser(userData);

//     // Check if user already enrolled in this course
//     const enrolledRes = await fetch(
//       `http://localhost:1337/api/enrolled-courses?filters[users_permissions_users][id][$eq]=${userData.id}&filters[courses][id][$eq]=${courseId}`,
//       {
//         headers: { Authorization: `Bearer ${jwt}` },
//       }
//     );

//     const enrolledData = await enrolledRes.json();
//     const isUserEnrolled = enrolledData?.data?.length > 0;

//     setIsEnrolled(isUserEnrolled);
//     if (isUserEnrolled) {
//       router.push(`/learning/${courseId}`);
//     }
//   }
