import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-async-light";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/components/theme/ThemeProvider";

// Register a curated set of common languages. The async-light build fetches
// each language grammar on demand, keeping the base bundle small.
import jsLang from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import tsLang from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import jsxLang from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import tsxLang from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import pyLang from "react-syntax-highlighter/dist/esm/languages/prism/python";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bashLang from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import sqlLang from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import markupLang from "react-syntax-highlighter/dist/esm/languages/prism/markup";

SyntaxHighlighter.registerLanguage("javascript", jsLang);
SyntaxHighlighter.registerLanguage("js", jsLang);
SyntaxHighlighter.registerLanguage("typescript", tsLang);
SyntaxHighlighter.registerLanguage("ts", tsLang);
SyntaxHighlighter.registerLanguage("jsx", jsxLang);
SyntaxHighlighter.registerLanguage("tsx", tsxLang);
SyntaxHighlighter.registerLanguage("python", pyLang);
SyntaxHighlighter.registerLanguage("py", pyLang);
SyntaxHighlighter.registerLanguage("json", jsonLang);
SyntaxHighlighter.registerLanguage("bash", bashLang);
SyntaxHighlighter.registerLanguage("sh", bashLang);
SyntaxHighlighter.registerLanguage("sql", sqlLang);
SyntaxHighlighter.registerLanguage("html", markupLang);
SyntaxHighlighter.registerLanguage("xml", markupLang);

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders assistant answers as GitHub-flavored Markdown with syntax-highlighted
 * code blocks. Styling for prose lives in `.prose-answer` (index.css).
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const codeStyle = resolvedTheme === "dark" ? oneDark : oneLight;

  return (
    <div className="prose-answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                language={match?.[1] ?? "text"}
                style={codeStyle}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
          a({ children, ...props }) {
            return (
              <a target="_blank" rel="noreferrer noopener" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
