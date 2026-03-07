import ImageKit from "imagekit";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      return new Response(
        JSON.stringify({ error: "ImageKit environment variables are missing" }),
        { status: 500 }
      );
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    const formData = await req.formData();
    const file = formData.get("files");

    const jobPosition = formData.get("jobPosition");
    const jobDescription = formData.get("jobDescription");
    const skills = formData.get("skills");
    const experience = formData.get("experience");

    if (!file || typeof file === "string") {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name || `resume-${Date.now()}.pdf`;

    const uploadPdf = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${safeName}`,
      useUniqueFileName: true,
      folder: "/resumes",
      isPublished: true,
    });

    // Use production n8n URL from environment variable or fallback to localhost
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook-test/generate-interview-questions";
    console.log("Calling n8n webhook:", n8nWebhookUrl);

    const n8nRes = await fetch(
      n8nWebhookUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "resume-url": uploadPdf.url,
          jobPosition,
          jobDescription,
          skills,
          experience,
        }),
      }
    );

    if (!n8nRes.ok) {
      const n8nText = await n8nRes.text();
      return new Response(
        JSON.stringify({
          error: "n8n webhook failed",
          status: n8nRes.status,
          details: n8nText,
        }),
        { status: 502 }
      );
    }

    const n8nData = await n8nRes.json();
    console.log("n8n webhook response:", JSON.stringify(n8nData, null, 2));

    return new Response(
      JSON.stringify({
        message: "File uploaded successfully",
        url: uploadPdf.url,
        fileId: uploadPdf.fileId,
        n8nResponse: n8nData,
        interviewQuestions: n8nData?.questions || n8nData,
        meta: { jobPosition, jobDescription, skills, experience },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in generate-interview-questions:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to upload file",
        details: error?.message || "Unknown error",
      }),
      { status: 500 }
    );
  }
}