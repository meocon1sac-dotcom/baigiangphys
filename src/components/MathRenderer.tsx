import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = "",
  inline = false,
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return "";

    try {
      // If the content is purely a math formula (starts with \ or doesn't have regular text separators)
      if (inline) {
        return katex.renderToString(content, {
          throwOnError: false,
          displayMode: false,
        });
      }

      // Parse mixed text with inline $...$ or display $$...$$
      const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
      
      const parts = content.split(regex);
      return parts
        .map((part) => {
          if (!part) return "";
          if (part.startsWith("$$") && part.endsWith("$$")) {
            const math = part.slice(2, -2).trim();
            return katex.renderToString(math, {
              throwOnError: false,
              displayMode: true,
            });
          }
          if (part.startsWith("\\[") && part.endsWith("\\]")) {
            const math = part.slice(2, -2).trim();
            return katex.renderToString(math, {
              throwOnError: false,
              displayMode: true,
            });
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            const math = part.slice(1, -1).trim();
            return katex.renderToString(math, {
              throwOnError: false,
              displayMode: false,
            });
          }
          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            const math = part.slice(2, -2).trim();
            return katex.renderToString(math, {
              throwOnError: false,
              displayMode: false,
            });
          }
          // Escape HTML in raw text to prevent XSS
          return part
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");
        })
        .join("");
    } catch (e) {
      console.warn("Math rendering error:", e);
      return content;
    }
  }, [content, inline]);

  return (
    <span
      className={`math-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
