import 'hello-csv/peer/index.css';
import Header from './components/Header';
import CodeBlock from './components/CodeBlock';
import Footer from './components/Footer';
import { EXAMPLE_CODE } from './constants';
import {
  EmployeeSheetImporter,
  EmployeeImporter,
} from './components/importers';
import InstallTabs from './components/InstallTabs';
import Section from './components/Section';

export default function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />

      <Section>
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-10 text-lg lg:py-24">
          <div className="m-auto mb-12 text-gray-800 md:w-[650px] lg:px-8">
            <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
              Installation
            </h3>
            <p>
              Works with any Javascript application,{' '}
              <span className="font-semibold italic">
                {"even if you don't use React."}
              </span>
            </p>
          </div>
          <InstallTabs />
        </div>
      </Section>

      <Section className="bg-gray-100">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-10 text-lg lg:py-24">
          <a id="introduction"></a>
          <div className="m-auto mb-12 text-gray-800 md:w-[650px] lg:px-8">
            <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
              Building a CSV uploader is hard
            </h3>
            <p className="text-lg">
              HelloCSV is a javascript library that makes it easy to drop in a
              powerful, intuitive, and elegant CSV uploader that works with any
              javascript application. <b>No React required.</b>
            </p>
            <br />
            <p>
              {"The best part? It's "}
              <span className="underline decoration-blue-500 decoration-4 underline-offset-6">
                free and open source.
              </span>
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-10 text-lg lg:py-24">
          <a id="getting-started"></a>
          <div className="m-auto mb-12 text-gray-800 md:w-[650px] lg:px-8">
            <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
              Drop in an uploader into your app in seconds
            </h3>
            <p>
              A simple, yet powerful Javascript API to fit your needs.
              Transform, validate, clean, and slice your data.
            </p>
          </div>

          <CodeBlock code={EXAMPLE_CODE} />
        </div>
      </Section>

      <Section className="bg-gray-100">
        <EmployeeImporter />
      </Section>

      <Section>
        <EmployeeSheetImporter />
      </Section>

      <Footer />
    </div>
  );
}
