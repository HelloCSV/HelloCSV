import { useEffect } from "preact/hooks";
import { basicEditor } from "prism-code-editor/setups"
import { copyButton } from "prism-code-editor/copy-button"
import "prism-code-editor/prism/languages/javascript"
import "prism-code-editor/themes/atom-one-dark.css"
import Content from "./Content";

let editor: any = null;
export default function TryItYourself({ code }: { code: string }) {
  useEffect(() => {
    editor = basicEditor(
      "#editor",
      {
        language: "javascript",
        theme: "github-dark",
        value: code,
      },
      () => {

      },
    )
    editor.addExtensions(copyButton());
  }, []);

  const runCode = () => {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = editor.textarea.value;
    document.getElementById("anchor")!.appendChild(script);
    document.getElementById("importer-container")!.classList.remove("hidden");
    document.getElementById("importer-container")!.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <Content>
      <div className="flex flex-col gap-4">
        <div id="editor"></div>
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p className="text-gray-500 text-sm my-4">
              <i>(You can edit this</i> ☝<i>)</i>️
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => runCode()}
            className="text-md mr-3 cursor-pointer rounded-full px-6 py-2.5 font-semibold text-white bg-blue-600 shadow-xs hover:opacity-80"
          >
            Create your importer ❯
          </button>
        </div>

        <div id="anchor"></div>
        <div id="importer-container" className="hidden">
          <div id="importer" className="rounded-lg border border-gray-200 bg-white px-2 py-6 sm:px-8"></div>
        </div>
      </div>
    </Content>
  );
}
