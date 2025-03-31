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

export default function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />

      <div className="section">
        <div className="content">
          <div className="documentation-container">
            <h3 className="font-title">Installation</h3>
            <p>
              Works with any Javascript application,{' '}
              <span className="font-semibold italic">
                {"even if you don't use React."}
              </span>
            </p>
          </div>
          <InstallTabs />
        </div>
      </div>

      <div className="section">
        <div className="content">
          <a id="introduction"></a>
          <div className="documentation-container">
            <h3 className="font-title">Building a CSV uploader is hard</h3>
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
      </div>

      <div className="section">
        <div className="content">
          <a id="getting-started"></a>
          <div className="documentation-container">
            <h3 className="font-title">
              Drop in an uploader into your app in seconds
            </h3>
            <p>
              A simple, yet powerful Javascript API to fit your needs.
              Transform, validate, clean, and slice your data.
            </p>
          </div>

          <CodeBlock code={EXAMPLE_CODE} />
        </div>
      </div>

      <div className="section">
        <EmployeeImporter />
      </div>

      <div className="section mb-16">
        <EmployeeSheetImporter />
      </div>

      <Footer />
    </div>
  );
}
