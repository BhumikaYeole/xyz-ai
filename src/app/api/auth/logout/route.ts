export async function POST() {
  const response = Response.json({ success: true });
  (response.headers as Headers).append(
    'Set-Cookie',
    'xyz-ai-token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'
  );
  return response;
}
