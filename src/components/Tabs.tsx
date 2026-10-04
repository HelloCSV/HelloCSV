import Select, { SelectOption } from './Select';

type Tab = SelectOption<string>;

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  idPrefix?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  idPrefix,
}: Props) {
  return (
    <div>
      <div className="hc:grid hc:grid-cols-1 hc:sm:hidden">
        <Select
          options={tabs}
          value={activeTab}
          onChange={(tab) => onTabChange(tab as string)}
        />
      </div>
      <div className="hc:hidden hc:sm:block">
        <div className="hc:border-hello-csv-border hc:border-b">
          <nav
            aria-label="Tabs"
            className="hc:-mb-px hc:flex hc:space-x-8"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                id={`${idPrefix}-tab-${tab.value}`}
                key={tab.label}
                role="tab"
                aria-selected={tab.value === activeTab}
                aria-current={tab.value === activeTab ? 'page' : undefined}
                aria-controls={`${idPrefix}-tabpanel-${tab.value}`}
                onClick={() => onTabChange(tab.value)}
                className={` ${
                  tab.value === activeTab
                    ? 'hc:border-hello-csv-primary hc:text-hello-csv-primary'
                    : 'hc:text-hello-csv-text-muted hc:hover:border-hello-csv-border-strong hc:hover:text-hello-csv-text hc:border-transparent'
                } hc:flex hc:cursor-pointer hc:items-center hc:border-b-2 hc:px-1 hc:py-4 hc:text-sm hc:font-medium hc:whitespace-nowrap`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
