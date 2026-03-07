import ImageKit from "imagekit";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { InterviewSessionTable, SpeakSmartAI } from "@/utils/schema";

export const runtime = "nodejs";

function normalizeQuestions(n8nData) {
  const tryParseJson = (value) => {
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const withoutFences = trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    try {
      return JSON.parse(withoutFences);
    } catch {
      return null;
    }
  };

  const unwrap = (value) => {
    if (Array.isArray(value) && value.length === 1 && value[0]?.json) {
      return value[0].json;
    }

    return value;
  };

  const parseTextQuestions = (text) => {
    if (typeof text !== "string" || !text.trim()) return [];

    return text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(\d+\.|[-*])\s*/, "").trim())
      .filter((line) => line.length > 15)
      .map((question, index) => ({
        id: index + 1,
        question,
        category: "general",
      }));
  };

  const source = unwrap(n8nData);

  // Handle Gemini-like payload: { content: { parts: [{ text: "[...]" }] } }
  const partsText = source?.content?.parts
    ?.map((part) => part?.text)
    .filter(Boolean)
    .join("\n");

  const parsedFromParts = tryParseJson(partsText);
  if (Array.isArray(parsedFromParts)) {
    return parsedFromParts
      .map((item, index) => {
        if (typeof item === "string") {
          return { id: index + 1, question: item, category: "general" };
        }

        return {
          id: index + 1,
          question: item?.question || item?.text || item?.prompt || item?.content || "",
          category: item?.category || "general",
        };
      })
      .filter((item) => item.question);
  }

  const explicitList = [
    source?.questions,
    source?.interviewQuestions,
    source?.data?.questions,
    source?.data?.interviewQuestions,
    source?.result?.questions,
    source?.output?.questions,
    Array.isArray(source) ? source : null,
  ].find((item) => Array.isArray(item));

  if (explicitList) {
    return explicitList
      .map((item, index) => {
        if (typeof item === "string") {
          return { id: index + 1, question: item, category: "general" };
        }

        return {
          id: index + 1,
          question: item?.question || item?.text || item?.prompt || item?.content || "",
          category: item?.category || "general",
        };
      })
      .filter((item) => item.question);
  }

  // Handle question1/question2/... style objects.
  const numberedQuestions = Object.keys(source || {})
    .filter((key) => /^question\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")))
    .map((key, index) => ({
      id: index + 1,
      question: String(source[key] || "").trim(),
      category: "general",
    }))
    .filter((item) => item.question);

  if (numberedQuestions.length > 0) {
    return numberedQuestions;
  }

  const textSource =
    partsText ||
    source?.outputText ||
    source?.output ||
    source?.result ||
    source?.message ||
    source?.raw;

  return parseTextQuestions(textSource);
}

export async function POST(req) {
  try {
    const { userId } = await auth();
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

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return new Response(
        JSON.stringify({ error: "N8N_WEBHOOK_URL is missing" }),
        { status: 500 }
      );
    }

    if (n8nWebhookUrl.includes("/webhook-test/")) {
      return new Response(
        JSON.stringify({
          error: "N8N_WEBHOOK_URL points to webhook-test",
          details: "Use production endpoint (/webhook/...) instead of /webhook-test/.",
        }),
        { status: 500 }
      );
    }

    const n8nPayload = {
      "resume-url": uploadPdf.url,
      resumeUrl: uploadPdf.url,
      resume_url: uploadPdf.url,
      fileName: safeName,
      mimeType: file.type,
      jobPosition,
      jobDescription,
      skills,
      experience,
      useUploadedResume: true,
      testMode: false,
      source: "smartspeekai",
    };

    console.log("Calling n8n webhook:", n8nWebhookUrl);
    console.log("n8n payload:", JSON.stringify(n8nPayload));

    const n8nRes = await fetch(
      n8nWebhookUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
        cache: "no-store",
      }
    );

    if (!n8nRes.ok) {
      const n8nText = await n8nRes.text();
      console.error("n8n webhook failed:", {
        status: n8nRes.status,
        url: n8nWebhookUrl,
        body: n8nText,
      });

      return new Response(
        JSON.stringify({
          error: "n8n webhook failed",
          status: n8nRes.status,
          url: n8nWebhookUrl,
          details: n8nText,
        }),
        { status: 502 }
      );
    }

    const responseText = await n8nRes.text();
    let n8nData;

    try {
      n8nData = JSON.parse(responseText);
    } catch {
      n8nData = { raw: responseText };
    }

    const questions = normalizeQuestions(n8nData);
    const mockId = `session-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Save to InterviewSessionTable
    await db.insert(InterviewSessionTable).values({
      mockId,
      interviewQuestions: JSON.stringify(questions),
      resumeUrl: uploadPdf.url,
      userId: userId || "anonymous",
      userEmail: null,
      jobPosition: jobPosition || null,
      jobDescription: jobDescription || null,
      skills: skills || null,
      jobExperience: experience || null,
      createdAt: timestamp,
      status: "completed",
    });

    // Save MockJsonResponse to SpeakSmartAI table
    await db.insert(SpeakSmartAI).values({
      jsonResp: JSON.stringify(n8nData),
      mockId,
      jobPosition: jobPosition || "Not Specified",
      jobDescription: jobDescription || "Not Specified",
      jobExperience: experience || "0",
      createdBy: userId || "anonymous",
      createdAt: timestamp,
      userEmail: null,
    });

    console.log("✅ Data saved to both InterviewSessionTable and SpeakSmartAI tables");

    console.log("n8n webhook response:", JSON.stringify(n8nData, null, 2));
    console.log("normalized questions count:", questions.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: "File uploaded successfully",
        resume: {
          url: uploadPdf.url,
          fileId: uploadPdf.fileId,
          fileName: safeName,
        },
        request: { jobPosition, jobDescription, skills, experience },
        mockId,
        questions,
        questionsCount: questions.length,
        n8nResponse: n8nData,
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