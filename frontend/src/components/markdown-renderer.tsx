"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content text-[14px] leading-relaxed select-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-[20px] font-semibold text-white mt-4 mb-2 tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[18px] font-medium text-[#22d3ee] mt-3.5 mb-2 tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[16px] font-medium text-white mt-3 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#ffb829] mt-3 mb-1 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[14px] text-[#e2e8f0] font-normal leading-[1.65] mb-2.5 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 mb-2.5 text-[#cbd5e1] marker:text-[#8052ff]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 mb-2.5 text-[#cbd5e1] marker:text-[#22d3ee]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[13.5px] leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#cbd5e1]">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#8052ff] pl-3 py-1 my-2.5 bg-white/[0.03] text-[#cbd5e1] text-[13px] rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="w-full my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-[13px] border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5 border-b border-white/10 text-[11px] font-mono uppercase text-[#ffb829]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-3 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 align-top">{children}</td>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-white/10 text-[#22d3ee] px-1.5 py-0.5 rounded text-[12px] font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[#050505] border border-white/10 rounded-xl p-3 my-2 text-[12px] font-mono text-[#22d3ee] overflow-x-auto">
                <code>{children}</code>
              </pre>
            );
          },
          hr: () => <hr className="border-white/10 my-3" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22d3ee] hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
