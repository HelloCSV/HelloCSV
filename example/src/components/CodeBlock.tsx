import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-dark.css';

export default function CodeBlock({ code }: { code: string }) {
  hljs.registerLanguage('javascript', javascript);

  return (
    <>
      <pre className="lg:text-md mt-6 max-h-[600px] overflow-auto rounded-lg bg-slate-800 p-4 text-xs text-white lg:p-8">
        <code
          className="language-javascript"
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(code, { language: 'jsx' }).value,
          }}
        />
      </pre>
    </>
  );
}
