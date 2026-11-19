export async function onRequestPost({ request, env }) {
  if (!env.AI) {
    return Response.json(
      { error: "AI image service is not connected yet. Enable the Workers AI binding named AI in Cloudflare Pages settings." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 2048) {
    return Response.json({ error: "Please provide a scene prompt under 2048 characters." }, { status: 400 });
  }

  try {
    const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
      prompt,
      steps: 4,
      seed: Math.floor(Math.random() * 2147483647)
    });
    if (!result || !result.image) {
      return Response.json({ error: "The image model returned no image. Please try again." }, { status: 502 });
    }
    return Response.json({ image: "data:image/jpeg;base64," + result.image });
  } catch (error) {
    return Response.json(
      { error: "Image generation failed. " + (error?.message || "Please try again later.") },
      { status: 502 }
    );
  }
}
