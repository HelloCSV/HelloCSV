import { useState } from 'preact/hooks';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function InstallTabs() {
  const [tabs, setTabs] = useState([
    {
      name: 'npm',
      code: 'npm install hello-csv',
      current: false,
      terminal: true,
    },
    {
      name: 'yarn',
      code: 'yarn add hello-csv',
      current: false,
      terminal: true,
    },
    {
      name: 'no build',
      code: `<!-- Paste this into your HTML file -->\n<script src="https://cdn.jsdelivr.net/npm/hello-csv@0.3.3/dist/bundled/index.es.js"></script>\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/hello-csv@0.3.3/dist/bundled/hello-csv.css">`,
      current: true,
      terminal: false,
    },
  ]);

  return (
    <div className="flex flex-row gap-2 rounded-lg bg-slate-800 p-2">
      <div>
        <nav aria-label="Tabs" className="flex space-x-4">
          {tabs.map((tab) => (
            <a
              key={tab.name}
              href="#"
              aria-current={tab.current ? 'page' : undefined}
              className={classNames(
                tab.current
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-200 hover:text-gray-100',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
              onClick={(e) => {
                e.preventDefault();
                setTabs(
                  tabs.map((t) => ({ ...t, current: t.name === tab.name }))
                );
              }}
            >
              {tab.name}
            </a>
          ))}
        </nav>
        <div className="mt-3 p-2 text-white">
          <pre>
            {tabs.find((tab) => tab.current)?.terminal ? (
              <span className="text-white">
                $ {tabs.find((tab) => tab.current)?.code}
              </span>
            ) : (
              <span className="text-sm text-white">
                {tabs.find((tab) => tab.current)?.code}
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
