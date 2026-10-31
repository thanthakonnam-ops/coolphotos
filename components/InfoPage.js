import Header from './Header';
import Footer from './Footer';

// Shared layout for text pages (FAQ, terms, privacy)
export default function InfoPage({ icon, title, updated, children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 mb-2">
          <i className={`fa-solid ${icon} text-orange-500`}></i>
          <span>{title}</span>
        </h1>
        {updated && <p className="text-xs text-slate-500 mb-8">ปรับปรุงล่าสุด: {updated}</p>}

        <div className="space-y-8 text-sm leading-relaxed text-slate-300 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-orange-400 [&_a:hover]:underline">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Contact details shown at the end of each text page (same as the footer)
export function ContactSection() {
  return (
    <section>
      <h2>ติดต่อเรา</h2>
      <ul>
        <li>
          LINE: <a href="https://line.me/ti/p/~theantn47">theantn47</a>
        </li>
        <li>อีเมล: theamtn2547@gmail.com</li>
        <li>โทร: 092-237-9475</li>
      </ul>
    </section>
  );
}
