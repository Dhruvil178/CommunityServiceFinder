import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const stripMarkdown = text =>
  text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const generateCertificateContent = async ({
  studentName,
  eventName,
  date,
}) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const prompt = `
You are writing the body text of an NGO Certificate of Participation.

Write a formal, professional, and inspiring certificate message in 2 short paragraphs.

Details:
- Student Name: ${studentName}
- Event Name: ${eventName}
- Event Date: ${date}

Requirements:
1) Clearly acknowledge successful participation and completion
2) Mention the student name and event name naturally
3) Keep a warm NGO/community-service tone
4) Return only plain text (no markdown, no bullets, no headings, no JSON)
  `.trim();

  let rawText;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // updated to a real model name
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    });
    rawText = response?.content?.[0]?.text?.trim();
  } catch (error) {
    console.error('Anthropic API error, using fallback certificate text:', error.message);
  }

  if (!rawText) {
    return `${studentName} has successfully completed and contributed to ${eventName} on ${date}. We sincerely appreciate this commitment to meaningful community service and responsible civic participation.`;
  }

  return stripMarkdown(rawText);
};
