import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ClipboardList,
  FileSearch,
  FileText,
  Users,
  CalendarClock,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import LandingChatWidget from '../components/LandingChatWidget';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'For Stewards', href: '#personas' },
  { label: 'For Members', href: '#personas' },
  { label: 'About', href: '#how' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Grievance Drafting',
    body: 'Describe what happened in plain language — the assistant turns it into a contract-aware draft you can refine and file.',
  },
  {
    icon: ClipboardList,
    title: 'Case Tracking',
    body: 'Move each case through Informal A, Formal A, Formal B, and arbitration with status, owners, and timelines in one view.',
  },
  {
    icon: FileSearch,
    title: 'Document Audit Trail',
    body: 'Upload PS Forms, statements, and evidence. Every action is timestamped, so the chain of custody is never in doubt.',
  },
  {
    icon: FileText,
    title: 'Templates Library',
    body: 'Reusable templates for common violations — overtime, hostile work environment, route inspections, and more.',
  },
  {
    icon: Users,
    title: 'Steward Collaboration',
    body: 'Assign cases to stewards and reps, share notes, and keep the member informed without a thread of texts.',
  },
  {
    icon: CalendarClock,
    title: 'Deadline Reminders',
    body: 'Calendar view plus push notifications for the 14-day filing window and step deadlines — never miss a clock.',
  },
];

const PERSONAS = [
  {
    icon: Truck,
    title: 'NALC Letter Carriers',
    body: 'City carriers filing grievances under the NALC-USPS National Agreement. The platform knows your contract articles and time limits.',
  },
  {
    icon: Truck,
    title: 'NRLCA Rural Carriers',
    body: 'Rural carriers working under the NRLCA agreement get craft-specific guidance and templates tuned to your CBA.',
  },
  {
    icon: UserCheck,
    title: 'Stewards & Branch Officers',
    body: 'Manage every case in your branch, watch deadlines across members, and hand off cleanly between steps.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Sign up',
    body: 'Create an account in under a minute. Pick your union and craft — UnionCase configures itself to your contract.',
  },
  {
    n: '02',
    title: 'File with AI assistance',
    body: 'Describe the incident; the assistant drafts a grievance citing the right articles. Review, edit, and submit.',
  },
  {
    n: '03',
    title: 'Track to resolution',
    body: 'Watch each case advance through CBA steps. Get reminded before every deadline; keep everything in one audit trail.',
  },
];

const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-white text-gray-900">
      {/* Top nav */}
      <nav className="bg-primary text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/images/unioncase-logo.png"
                alt="UnionCase"
                className="h-8 w-8 rounded"
              />
              <span className="font-bold text-lg tracking-tight">UnionCase</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-primary-light hover:text-white transition-colors"
              >
                Portal Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-white text-primary px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-primary-dark border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded text-sm text-white/80 hover:text-white hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded text-sm font-medium text-primary-light hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Portal Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded text-sm font-semibold bg-white text-primary text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at top right, rgba(0,102,204,0.35), transparent 60%), linear-gradient(135deg, #002244 0%, #003366 55%, #002244 100%)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary-light uppercase mb-4">
              AI Grievance Management
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Don't just file.
              <br />
              <span className="text-primary-light">Win.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              AI-powered grievance management for postal workers. Draft contract-aware
              grievances, track every case through CBA steps, and never miss a deadline.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-white/60">
              <ShieldCheck className="h-4 w-4" />
              Built for NALC and NRLCA members. Free trial, no credit card.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="platform" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Platform
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              Everything a postal worker needs to file and win a grievance.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              UnionCase combines AI drafting with disciplined case tracking, so nothing
              falls through the cracks between Step A and arbitration.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all bg-white"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section id="personas" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Who it's for
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              Built for the people who actually file grievances.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERSONAS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-7 rounded-2xl bg-white border border-gray-200"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              How it works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              From incident to resolution in three steps.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                <div className="text-5xl font-bold text-primary/15 leading-none">
                  {step.n}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-base text-gray-600 leading-relaxed">
                  {step.body}
                </p>
                {/* Placeholder device frame — swap for a real screenshot later */}
                <div className="mt-6 aspect-[4/3] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Screenshot
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA band */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to take your grievances seriously?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Start your free trial and file your first AI-assisted grievance today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/images/unioncase-logo.png"
              alt="UnionCase"
              className="h-7 w-7 rounded"
            />
            <span className="font-semibold text-white">UnionCase</span>
            <span className="hidden sm:inline text-sm">
              — AI grievance management for postal workers
            </span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} UnionCase. All rights reserved.
          </p>
        </div>
      </footer>

      <LandingChatWidget />
    </div>
  );
};

export default LandingPage;
