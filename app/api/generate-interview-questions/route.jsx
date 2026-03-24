import ImageKit from "imagekit";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { InterviewSessionTable, SpeakSmartAI } from "@/utils/schema";


function cleanQuestionText(value) {
  if (!value) return "";
  return String(value)
    .replace(/^\s*(\d+\.|[-*])\s*/, "")
    .replace(/^\s*(question\s*\d*\s*[:.-])\s*/i, "")
    .trim();
}

function isLikelyQuestion(value) {
  if (!value) return false;
  const text = String(value).trim();
  const lowered = text.toLowerCase();
  if (text.length < 10) return false;
  if (/^["\[{}\],:]/.test(text) || /^["}\],]+$/.test(text)) return false;
  if (/^"[^"]+"\s*:\s*"[^"]*"[,}]?$/.test(text)) return false;
  if (/^"[^"]+"\s*:\s*\[/.test(text)) return false;
  if (/^"[^"]+",?\s*$/.test(text) && !/\?/.test(text)) return false;
  if (/^(answer|sample answer|ideal answer|correct answer|expected answer|model answer)\s*[:.-]/i.test(text)) return false;
  if (/^(job\s*(title|position|role|details|description)|company|skills|experience|qualifications|requirements)\s*[:.-]/i.test(text)) return false;
  if (/"?(answer|job_position|job_description|skills_assumed|experience_level|job_title)"?\s*:/i.test(text)) return false;
  return true;
}


function normalizeQuestions(n8nData) {
  function toQuestionItem(value, index) {
    const cleaned = cleanQuestionText(value);
    if (!isLikelyQuestion(cleaned)) return null;
    return {
      id: index + 1,
      question: cleaned,
      category: "general",
    };
  }

  function mapQuestionList(list) {
    return list
      .map((item, index) => {
        if (typeof item === "string") {
          return toQuestionItem(item, index);
        }
        if (!item || typeof item !== "object") return null;
        const explicitQuestion =
          item?.question ||
          item?.interviewQuestion ||
          item?.text ||
          item?.prompt ||
          item?.content ||
          item?.title;
        const fallbackQuestion =
          Object.entries(item).find(([key]) => /question/i.test(key))?.[1] || "";
        return toQuestionItem(explicitQuestion || fallbackQuestion, index);
      })
      .filter(Boolean);
  }

  function tryParseJson(value) {
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
  }

  function unwrap(value) {
    if (Array.isArray(value) && value.length === 1 && value[0]?.json) {
      return value[0].json;
    }
    return value;
  }

  function parseTextQuestions(text) {
    if (typeof text !== "string" || !text.trim()) return [];
    // First try to parse as JSON
    const parsedJson = tryParseJson(text);
    if (parsedJson) {
      // If it has a questions array, extract from there
      if (Array.isArray(parsedJson?.questions)) {
        return parsedJson.questions
          .map((item, index) => {
            const questionText = item?.question || item?.interviewQuestion || item?.text || item?.prompt;
            if (!questionText) return null;
            return {
              id: index + 1,
              question: cleanQuestionText(questionText),
              category: item?.category || "general",
            };
          })
          .filter((item) => item && item.question.length > 0);
      }
      // If it's an array, use standard mapping
      if (Array.isArray(parsedJson)) {
        return mapQuestionList(parsedJson);
      }
    }
    // Fallback: parse as plain text lines
    return text
      .split(/\r?\n/)
      .map((line) => cleanQuestionText(line))
      .filter((line) => isLikelyQuestion(line))
      .map((question, index) => ({ id: index + 1, question, category: "general" }));
  }

  const source = unwrap(n8nData);
  // Handle Gemini-like payload: { content: { parts: [{ text: "[...]" }] } }
  const partsText = source?.content?.parts
    ?.map((part) => part?.text)
    .filter(Boolean)
    .join("\n");
  // Try to parse parts text as JSON first
  const parsedFromParts = tryParseJson(partsText);
  if (parsedFromParts) {
    // Check if it has a questions array with question/answer pairs
    if (Array.isArray(parsedFromParts?.questions)) {
      const extractedQuestions = parsedFromParts.questions
        .map((item, index) => {
          const questionText = item?.question || item?.interviewQuestion || item?.text || item?.prompt;
          if (!questionText) return null;
          return {
            id: index + 1,
            question: cleanQuestionText(questionText),
            category: item?.category || "general",
          };
        })
        .filter((item) => item && item.question.length > 0);
      if (extractedQuestions.length > 0) {
        return extractedQuestions;
      }
    }
    // If it's just an array of questions
    if (Array.isArray(parsedFromParts)) {
      return mapQuestionList(parsedFromParts);
    }
  }
  // Try direct questions array access
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
    // Check if it's an array of question/answer objects
    const hasQuestionField = explicitList.some((item) =>
      item && typeof item === "object" && (item.question || item.interviewQuestion)
    );
    if (hasQuestionField) {
      const extractedQuestions = explicitList
        .map((item, index) => {
          if (typeof item === "string") {
            return { id: index + 1, question: cleanQuestionText(item), category: "general" };
          }
          const questionText = item?.question || item?.interviewQuestion || item?.text || item?.prompt;
          if (!questionText) return null;
          return {
            id: index + 1,
            question: cleanQuestionText(questionText),
            category: item?.category || "general",
          };
        })
        .filter((item) => item && item.question.length > 0);
      if (extractedQuestions.length > 0) {
        return extractedQuestions;
      }
    }
    return mapQuestionList(explicitList);
  }
  // Handle question1/question2/... style objects.
  const numberedQuestions = Object.keys(source || {})
    .filter((key) => /^question\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")))
    .map((key, index) => ({
      id: index + 1,
      question: cleanQuestionText(source[key]),
      category: "general",
    }))
    .filter((item) => isLikelyQuestion(item.question));
  if (numberedQuestions.length > 0) {
    return numberedQuestions;
  }
  // Last resort: try to parse as text (but this should rarely be needed now)
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
    const user = await currentUser();
    const { userId } = await auth();
    const userEmail =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null;

    
    // Extract form data
    const formData = await req.formData();
    const file = formData.get("files");
    const jobPosition = formData.get("jobPosition") || "";
    const jobDescription = formData.get("jobDescription") || "";
    const skills = formData.get("skills") || "";
    const experience = formData.get("experience") || "";

    

    // Validate: either resume OR job details must be provided
    if (!file && (!jobPosition && !jobDescription && !skills && !experience)) {
      return new Response(
        JSON.stringify({
          error: "Please provide either a resume file OR job details (position, description, skills, experience)",
        }),
        { status: 400 }
      );
    }

    let uploadPdf = null;
    let resumeUrl = null;
    let safeName = null;

    // CASE 1: Resume file provided - upload to ImageKit
    if (file && typeof file !== "string") {
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

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      safeName = file.name || `resume-${Date.now()}.pdf`;

      uploadPdf = await imagekit.upload({
        file: buffer,
        fileName: `${Date.now()}-${safeName}`,
        useUniqueFileName: true,
        folder: "/resumes",
        isPublished: true,
      });

      resumeUrl = uploadPdf.url;
      console.log("✅ Resume uploaded successfully:", resumeUrl);
    }

    // Validate n8n webhook URL
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

    // Build n8n payload based on whether resume exists
    const n8nPayload = {
      jobPosition: jobPosition || null,
      jobDescription: jobDescription || null,
      skills: skills || null,
      experience: experience || null,
      testMode: false,
      source: "smartspeekai",
    };

    // If resume provided, add resume details
    if (resumeUrl) {
      n8nPayload["resume-url"] = resumeUrl;
      n8nPayload.resumeUrl = resumeUrl;
      n8nPayload.resume_url = resumeUrl;
      n8nPayload.fileName = safeName;
      n8nPayload.mimeType = file?.type || "application/pdf";
      n8nPayload.useUploadedResume = true;
    } else {
      n8nPayload.useUploadedResume = false;
    }

    console.log("Calling n8n webhook:", n8nWebhookUrl);
    console.log("Source:", resumeUrl ? "Resume File" : "Job Details Only");
    console.log("n8n payload:", JSON.stringify(n8nPayload));

    // Call n8n workflow
    let n8nRes;
    try {
      n8nRes = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
        cache: "no-store",
        timeout: 30000,
      });
    } catch (fetchError) {
      console.error("❌ n8n webhook connection failed:", {
        url: n8nWebhookUrl,
        error: fetchError?.message,
        code: fetchError?.code,
      });

      return new Response(
        JSON.stringify({
          error: "Failed to connect to n8n workflow",
          message: `Cannot reach n8n at ${n8nWebhookUrl}. Make sure n8n is running.`,
          details: fetchError?.message,
          code: fetchError?.code,
        }),
        { status: 503 }
      );
    }

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
      resumeUrl: resumeUrl || null,
      userId: userId || "anonymous",

      userEmail,
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
      userEmail,

    });

    console.log("✅ Data saved to both InterviewSessionTable and SpeakSmartAI tables");
    console.log("n8n webhook response:", JSON.stringify(n8nData, null, 2));
    console.log("normalized questions count:", questions.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: resumeUrl ? "Resume uploaded and analyzed successfully" : "Job details submitted successfully",
        source: resumeUrl ? "Resume File" : "Job Details Only",
        resume: resumeUrl ? {
          url: resumeUrl,
          fileId: uploadPdf?.fileId,
          fileName: safeName,
        } : null,
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
        error: "Failed to process request",
        details: error?.message || "Unknown error",
      }),
      { status: 500 }
    );
  }
}
