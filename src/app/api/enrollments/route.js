export async function POST(request) {
  const { courseId, paymentReference } = await request.json();

  // In a real app, you would save to your database
  console.log("Enrollment created:", {
    courseId,
    paymentReference,
    enrolledAt: new Date().toISOString(),
  });

  return Response.json({ success: true });
}
