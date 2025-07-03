import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not set" }, { status: 500 });
    }

    // Gemini API call
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: image.replace(/^data:image\/(png|jpe?g|heic);base64,/, ""),
                  },
                },
                {
                  text: `Extract the following metadata from this artwork image. If unsure, make your best guess. Return a JSON object with these fields: title, artist, year, medium, dimensions, description, confidence (0-1, your confidence in the result).`,
                },
              ],
            },
          ],
        }),
      }
    );

    const geminiData = await geminiRes.json();
    console.log(geminiData);
    // Try to extract JSON from the response
    let metadata = null;
    if (geminiData.candidates && geminiData.candidates[0]?.content?.parts) {
      const text = geminiData.candidates[0].content.parts[0].text;
      try {
        metadata = JSON.parse(text);
      } catch {
        // fallback: try to extract JSON substring
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          metadata = JSON.parse(match[0]);
        }
      }
    }
    if (!metadata) {
      return NextResponse.json({ error: "Could not extract metadata" }, { status: 500 });
    }
    return NextResponse.json(metadata);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 