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
      <div className="grid grid-cols-1 sm:hidden">
        <Select
          options={tabs}
          value={activeTab}
          onChange={(tab) => onTabChange(tab as string)}
        />
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav
            aria-label="Tabs"
            className="-mb-px flex space-x-8"
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
                    ? 'border-hello-csv-primary text-hello-csv-primary'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex cursor-pointer items-center border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
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
