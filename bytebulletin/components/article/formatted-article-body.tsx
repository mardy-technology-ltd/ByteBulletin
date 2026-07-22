"use client";

import { useMemo } from "react";
import { ExternalLink, BookOpen, Quote } from "lucide-react";

interface FormattedArticleBodyProps {
  content?: string | null;
  excerpt?: string | null;
  sourceName?: string;
  originalUrl?: string | null;
}

export function FormattedArticleBody({
  content,
  excerpt,
  sourceName = "Original Source",
  originalUrl,
}: FormattedArticleBodyProps) {
  const { paragraphs, sourceCreditText, rawUrl } = useMemo(() => {
    let rawText = content || excerpt || "";
    let extractedSourceCredit = "";
    let extractedUrl = originalUrl || "";

    // 1. Extract source credit lines if any
    const sourceCreditRegex = /(?:Read the full story at|appeared first on|Story originally published on|Source:)\s*([^\n\.]+\.?)/i;
    const match = rawText.match(sourceCreditRegex);
    if (match) {
      extractedSourceCredit = match[0];
      rawText = rawText.replace(sourceCreditRegex, "").trim();
    }

    // 2. Clean HTML tags & RSS artifacts completely to prevent raw code/attributes from appearing
    let cleanText = rawText
      // Remove <a> links but keep inner text
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, " ")
      // Clean HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      // Remove orphaned RSS attributes like oc="0" target="_blank">
      .replace(/\b[a-z]+="[^"]*"/gi, "")
      .replace(/target="_blank">/gi, "")
      // Collapse multiple whitespace
      .replace(/\s+/g, " ")
      .trim();

    // 3. Break into structured paragraphs
    let parsedParagraphs: string[] = [];

    // Split by newlines or sentence clusters
    const rawParagraphChunks = cleanText.split(/(?:\r?\n){2,}/);

    rawParagraphChunks.forEach((chunk) => {
      const trimmed = chunk.trim();
      if (trimmed.length > 200) {
        // Split very long blocks into 2-3 sentence chunks
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
        let currentChunk = "";

        sentences.forEach((sentence) => {
          currentChunk += sentence + " ";
          if (currentChunk.length >= 220) {
            parsedParagraphs.push(currentChunk.trim());
            currentChunk = "";
          }
        });

        if (currentChunk.trim().length > 0) {
          parsedParagraphs.push(currentChunk.trim());
        }
      } else if (trimmed.length > 20) {
        parsedParagraphs.push(trimmed);
      }
    });

    if (parsedParagraphs.length === 0 && cleanText.length > 0) {
      parsedParagraphs = [cleanText];
    }

    return {
      paragraphs: parsedParagraphs,
      sourceCreditText: extractedSourceCredit,
      rawUrl: extractedUrl,
    };
  }, [content, excerpt, originalUrl]);

  return (
    <div className="space-y-8 my-8 font-sans leading-relaxed">
      {/* Structured Justified Paragraphs */}
      <div className="space-y-6 sm:space-y-8 text-base sm:text-lg md:text-[19px] leading-[1.85] tracking-normal text-justify text-slate-900 dark:text-slate-200">
        {paragraphs.map((paragraph, index) => {
          const isFirst = index === 0;
          const isMiddleQuote = index === 1 && paragraphs.length >= 3;

          if (isMiddleQuote) {
            return (
              <div
                key={index}
                className="my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-slate-100 dark:from-violet-950/40 dark:via-purple-900/20 dark:to-slate-900/40 border-l-4 border-violet-500 shadow-lg backdrop-blur-md relative overflow-hidden group"
              >
                <Quote className="w-10 h-10 text-violet-500/20 absolute -right-2 -bottom-2 transform rotate-180 pointer-events-none" />
                <p className="text-lg sm:text-xl font-heading font-medium italic text-violet-950 dark:text-violet-100/95 leading-relaxed relative z-10">
                  &ldquo;{paragraph}&rdquo;
                </p>
              </div>
            );
          }

          return (
            <p
              key={index}
              className={`text-justify ${
                isFirst
                  ? "first-letter:float-left first-letter:text-5xl first-letter:font-extrabold first-letter:mr-3.5 first-letter:mt-1 first-letter:text-violet-600 dark:first-letter:text-violet-400 first-letter:font-heading first-letter:leading-none"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* External Original Source Callout Card */}
      {rawUrl && (
        <div className="mt-10 p-6 rounded-2xl bg-slate-100 dark:bg-gradient-to-br dark:from-violet-950/30 dark:via-slate-900/60 dark:to-black border border-violet-500/30 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-sm text-slate-800 dark:text-gray-300">
            <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-400/30 text-violet-600 dark:text-violet-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Want to read more from the original publisher?</p>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                {sourceCreditText || `Originally reported by ${sourceName}`}
              </p>
            </div>
          </div>

          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Read Full Story on {sourceName}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
