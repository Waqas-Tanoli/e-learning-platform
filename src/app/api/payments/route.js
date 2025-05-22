export async function POST(request) {
  const { courseId, amount, reference, status } = await request.json();

  // In a real app, you would save to your database
  console.log("Payment recorded:", {
    courseId,
    amount,
    reference,
    status,
    timestamp: new Date().toISOString(),
  });

  return Response.json({ success: true });
}
