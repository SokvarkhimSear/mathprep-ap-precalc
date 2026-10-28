import React, { useMemo } from 'react';
import katex from 'katex';
import { marked } from 'marked';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      console.warn('KaTeX rendering error:', e);
      return null;
    }
  }, [math, displayMode]);

  if (!html) {
    return (
      <span className={`font-latex italic ${className}`}>
        {math}
      </span>
    );
  }

  return (
    <span
      className={`font-latex inline-block ${displayMode ? 'w-full text-center' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Parses inline markdown (`**bold**` and `*italic*`) inside non-math text segments
 * while stripping stray unmatched asterisks.
 */
function renderInlineMarkdownSegment(segment: string, keyPrefix: string): React.ReactNode {
  if (!segment) return null;
  if (!segment.includes('*') && !segment.includes('_') && !segment.includes('#')) {
    return <span key={keyPrefix}>{segment}</span>;
  }

  const escaped = segment
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = escaped
    .replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '<strong>$1</strong>')
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
    .replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>')
    .replace(/\*\*/g, '')
    .replace(/#{2,}/g, '');

  return <span key={keyPrefix} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Helper component that renders text with embedded LaTeX math delimiter $...$ or $$...$$
 * while cleanly converting **bold** and *italic* markdown in non-math prose.
 */
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const parts = useMemo(() => {
    if (!text) return null;
    if (!text.includes('$')) {
      return [renderInlineMarkdownSegment(text, 'text-0')];
    }

    const segments: React.ReactNode[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push(
          renderInlineMarkdownSegment(
            text.substring(lastIndex, match.index),
            `text-${lastIndex}`
          )
        );
      }

      const raw = match[0];
      const isDisplay = raw.startsWith('$$');
      const mathContent = isDisplay ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim();

      segments.push(
        <MathRenderer
          key={`math-${match.index}`}
          math={mathContent}
          displayMode={isDisplay}
          className={isDisplay ? 'my-1' : 'mx-0.5'}
        />
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push(renderInlineMarkdownSegment(text.substring(lastIndex), 'text-end'));
    }

    return segments;
  }, [text]);

  return <span className={className}>{parts}</span>;
};

/**
 * Component that renders rich Markdown formatting (headings, lists, blockquotes, bold)
 * combined with KaTeX LaTeX math formulas ($...$ inline and $$...$$ display)
 * with dedicated .limmy-message typography.
 */
export const LimmyMarkdownMath: React.FC<{ content: string; className?: string }> = ({
  content,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Step 1: Protect and pre-render KaTeX math tokens to prevent Markdown parsers
    // from corrupting LaTeX underscores, asterisks, or brackets
    const mathTokens: string[] = [];
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

    const placeholderText = content.replace(mathRegex, (match) => {
      const isDisplay = match.startsWith('$$') || match.startsWith('\\[');
      let formula = '';
      if (match.startsWith('$$')) {
        formula = match.slice(2, -2).trim();
      } else if (match.startsWith('\\[')) {
        formula = match.slice(2, -2).trim();
      } else if (match.startsWith('\\(')) {
        formula = match.slice(2, -2).trim();
      } else {
        formula = match.slice(1, -1).trim();
      }

      let renderedFormula = match;
      try {
        renderedFormula = katex.renderToString(formula, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        });
      } catch {
        renderedFormula = match;
      }

      const tokenIndex = mathTokens.length;
      mathTokens.push(renderedFormula);
      return `%%KATEX_TOKEN_${tokenIndex}%%`;
    });

    // Step 2: Parse Markdown into HTML using marked
    let parsedHtml = '';
    try {
      parsedHtml = marked.parse(placeholderText, {
        gfm: true,
        breaks: true,
      }) as string;
    } catch {
      parsedHtml = placeholderText.replace(/\n/g, '<br/>');
    }

    // Step 3: Restore rendered KaTeX math tokens
    let finalHtml = parsedHtml.replace(/%%KATEX_TOKEN_(\d+)%%/g, (_m, idxStr) => {
      const idx = parseInt(idxStr, 10);
      return mathTokens[idx] || '';
    });

    return finalHtml;
  }, [content]);

  return (
    <div
      className={`limmy-message ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
