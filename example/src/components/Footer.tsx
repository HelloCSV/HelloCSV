import { BookOpenIcon } from '@heroicons/react/24/outline';
import { GitHubIcon } from './Icons';
const navigation = {
  main: [
    { name: 'About', href: '#' },
    { name: 'Documentation', href: 'https://github.com/HelloCSV/HelloCSV' },
    { name: 'GitHub', href: 'https://github.com/HelloCSV/HelloCSV' },
    {
      name: 'Support',
      href: 'https://stackoverflow.com/questions/tagged/hello-csv',
    },
  ],
  social: [
    {
      name: 'Documentation',
      href: 'https://github.com/HelloCSV/HelloCSV',
      icon: (props: any) => <BookOpenIcon {...props} />,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/HelloCSV/HelloCSV',
      icon: (props: any) => <GitHubIcon {...props} />,
    },
  ],
};

export default function Footer() {
  return (
    <div className="bg-slate-800 bg-cover bg-center text-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          aria-label="Footer"
          className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6"
        >
          {navigation.main.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-white"
            >
              {item.name}
            </a>
          ))}
        </nav>
        <div className="mt-16 flex justify-center gap-x-10">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-300"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon aria-hidden="true" className="size-6" />
            </a>
          ))}
        </div>
        <p className="mt-10 text-center text-sm/6 text-gray-400">
          &copy; 2025 HelloCSV, Inc.
        </p>
      </div>
    </div>
  );
}
