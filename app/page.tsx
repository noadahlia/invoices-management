import Link from 'next/link';
import { Users, Briefcase, FileText, Building2, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  {
    href:        '/company',
    label:       'Entreprise',
    description: 'Informations de votre entreprise',
    icon:        Building2,
    gradient:    'from-cyan-500 to-blue-600',
    border:      'hover:border-cyan-200',
    bg:          'hover:bg-cyan-50/50',
    shadow:      'hover:shadow-cyan-100',
  },
  {
    href:        '/clients',
    label:       'Clients',
    description: 'Gérez votre portefeuille client',
    icon:        Users,
    gradient:    'from-violet-500 to-purple-600',
    border:      'hover:border-violet-200',
    bg:          'hover:bg-violet-50/50',
    shadow:      'hover:shadow-violet-100',
  },
  {
    href:        '/services',
    label:       'Services',
    description: 'Catalogue et tarification',
    icon:        Briefcase,
    gradient:    'from-sky-400 to-blue-600',
    border:      'hover:border-sky-200',
    bg:          'hover:bg-sky-50/50',
    shadow:      'hover:shadow-sky-100',
  },
  {
    href:        '/invoices',
    label:       'Factures',
    description: 'Suivi et génération PDF',
    icon:        FileText,
    gradient:    'from-emerald-400 to-teal-600',
    border:      'hover:border-emerald-200',
    bg:          'hover:bg-emerald-50/50',
    shadow:      'hover:shadow-emerald-100',
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-14 max-w-2xl w-full">

        {/* Hero */}
        <div className="text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            Système de facturation
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Gestion de{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Factures
            </span>
          </h1>
          <p className="text-gray-500 text-base max-w-sm leading-relaxed">
            Créez, gérez et exportez vos factures professionnelles en quelques clics.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {NAV_ITEMS.map(({ href, label, description, icon: Icon, gradient, border, bg, shadow }) => (
            <Link key={href} href={href} className="group">
              <div className={`flex flex-col items-center gap-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${shadow} ${border} ${bg} h-full`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
