import { useEffect } from "preact/hooks";
import { minimalEditor, basicEditor, fullEditor, readonlyEditor } from "prism-code-editor/setups"
import { copyButton } from "prism-code-editor/copy-button"
import "prism-code-editor/prism/languages/javascript"
import Content from "./Content";

const code = `
import { renderImporter } from "hello-csv";

console.log("Running");
renderImporter(document.getElementById("importer"), {
  sheets: [
    {
      id: "employees",
      label: "Employees",
      columns: [
        {
          label: 'Name',
          id: 'name',
          type: 'string',
          validators: [{ validate: 'required' }],
        },
        {
          label: 'Email',
          id: 'email',
          type: 'string',
          validators: [
            { validate: 'required' },
            { validate: 'unique', error: 'This email is not unique' },
            {
              validate: 'regex_matches',
              regex:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              error: 'This email is not valid',
            },
          ],
        }
      ]
    }
  ]
});
`

let editor: any = null;
export default function TryItYourself() {
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
    console.log("runCode");
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = editor.textarea.value;
    document.getElementById("anchor")!.appendChild(script);
    document.getElementById("importer")!.classList.remove("hidden");
  }

  return (
    <Content>
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">Try It Yourself</h3>
        <p>
          Create your own importer — then copy and paste the code into your project.
        </p>
        <div id="editor"></div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => runCode()}
            className="text-md mr-3 cursor-pointer rounded-full px-6 py-2.5 font-semibold text-white bg-purple-600 shadow-xs hover:opacity-80"
          >
            Run ❯
          </button>
        </div>

        <div id="anchor"></div>
        <div id="importer" className="hidden rounded-lg border border-gray-200 bg-white px-2 py-6 sm:px-8"></div>
      </div>
    </Content>
  );
}
