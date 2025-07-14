import Header from './components/Header';
import Footer from './components/Footer';
import { EXAMPLE_CODE } from './constants';
import {
  EmployeeSheetImporter,
  EmployeeImporter,
  ExcelImporter,
} from './components/importers';
import InstallTabs from './components/InstallTabs';
import Section from './components/Section';
import Content from './components/Content';
import DocumentContainer from './components/DocumentContainer';
import TryItYourself from './components/TryItYourself';

export default function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />

      <Section>
        <Content>
          <DocumentContainer>
            <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
              Installation
            </h3>
            <p>
              Works with any Javascript application,{' '}
              <span className="font-semibold italic">
                {"even if you don't use React."}
              </span>
            </p>
          </DocumentContainer>
          <InstallTabs />
        </Content>
      </Section>

      <Section className="bg-gray-100">
        <Content>
          <a id="introduction"></a>
          <DocumentContainer>
            <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
              Building a CSV uploader is hard
            </h3>
            <p className="text-lg">
              HelloCSV is a javascript library that makes it easy to drop in a
              powerful, intuitive, and elegant CSV uploader that works with any
              Javascript application. <b>No React required.</b> (
              <a
                className="text-blue-500 underline"
                href="https://hellocsv.mintlify.app/v0.3.4/get-started/usage#react"
                target="_blank"
                rel="noreferrer noopener"
              >
                But it works with React too!
              </a>
              )
            </p>
            <br />
            <p>
              {"The best part? It's "}
              <span className="underline decoration-blue-500 decoration-4 underline-offset-6">
                free and open source.
              </span>
            </p>
          </DocumentContainer>
        </Content>
      </Section>

      <Section>
        <Content>
          <a id="getting-started"></a>
          <DocumentContainer>
            <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
              Drop in an uploader into your app in seconds
            </h3>
            <p>
              A simple, yet powerful Javascript API to fit your needs.
              Transform, validate, clean, and slice your data.
            </p>
            <p className="mt-4">
              Persists to local browser, so accidental page reloads won't
              destroy the user's progress.
            </p>
            <p className="mt-8 font-bold text-blue-500 underline decoration-blue-500 decoration-4 underline-offset-6">
              <a href="#try-it-yourself">Try it yourself ❯</a>
            </p>
          </DocumentContainer>

          <a id="try-it-yourself"></a>
          <TryItYourself code={EXAMPLE_CODE} />
        </Content>
      </Section>

      <Section className="bg-gray-100">
        <EmployeeImporter />
      </Section>

      <Section>
        <EmployeeSheetImporter />
      </Section>

      <Section>
        <ExcelImporter />
      </Section>

      <Footer />
    </div>
  );
}
