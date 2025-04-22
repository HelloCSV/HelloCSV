import { useEffect } from "preact/hooks";
import { basicEditor } from "prism-code-editor/setups"
import { copyButton } from "prism-code-editor/copy-button"
import "prism-code-editor/prism/languages/javascript"
import "prism-code-editor/themes/atom-one-dark.css"
import Content from "./Content";
import DocumentContainer from "./DocumentContainer";

const code = `import { renderImporter } from "hello-csv";

renderImporter(document.getElementById("importer"), {
  sheets: [
    {
      id: "employees",
      label: "Employees",
      columns: [
        { label: 'Name', id: 'name', type: 'string', validators: [{ validate: 'required' }] },
        { label: 'Phone', id: 'phone', type: 'string' },
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
        },
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
    document.getElementById("importer-container")!.classList.remove("hidden");
    document.getElementById("importer-container")!.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <Content>
      <div className="flex flex-col gap-4">
        <DocumentContainer>
          <h3 className="mb-6 text-2xl font-bold lg:text-4xl">Try It Yourself</h3>
          <div className="container leading-8">
            <p>Build your own importer — then copy and paste the code into your project.</p>
          </div>
          <p className="mt-8 text-lg italic">
            See the documentation{' '}
            <a className="text-blue-500 hover:text-blue-600" href="https://hellocsv.mintlify.app/">
               here
            </a>
            .
          </p>
        </DocumentContainer>
        <div id="editor"></div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => runCode()}
            className="text-md mr-3 cursor-pointer rounded-full px-6 py-2.5 font-semibold text-white bg-purple-600 shadow-xs hover:opacity-80"
          >
            See it in action ❯
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
