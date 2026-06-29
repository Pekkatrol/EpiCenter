import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-slate-800 text-white text-sm py-3 px-6 flex justify-between items-center">
      <span>© 2026 EpiCenter — BDE Epitech Nice</span>
      <div className="flex gap-4">
        <Link to="/team" className="underline hover:text-slate-300">Qui sommes-nous ?</Link>
        <a href="mailto:bde.nice@epitech.eu" className="underline hover:text-slate-300">Contact</a>
      </div>
    </footer>
  );
}

export default Footer;