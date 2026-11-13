import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, STATIC_LINKS } from '@/constants';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { CloseIcon } from '@/components/common/Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  shopLinks: { to: string; label: string }[];
  instagram?: string;
  signedIn: boolean;
}

export default function MobileMenu({ open, onClose, shopLinks, instagram, signedIn }: Props) {
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`drawer-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer drawer-left" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer-header">
          <span className="logo logo-sm">{APP_NAME}</span>
          <button className="icon-btn" aria-label="Đóng menu" onClick={onClose}><CloseIcon /></button>
        </div>
        <nav className="mobile-nav">
          {shopLinks.map((l) => <NavLink key={l.to} to={l.to} tabIndex={open ? 0 : -1}>{l.label}</NavLink>)}
        </nav>
        <nav className="mobile-nav mobile-nav-secondary">
          {STATIC_LINKS.map((l) => <NavLink key={l.to} to={l.to} tabIndex={open ? 0 : -1}>{l.label}</NavLink>)}
          <NavLink to="/campaign" tabIndex={open ? 0 : -1}>Campaign</NavLink>
          <NavLink to="/my-account" tabIndex={open ? 0 : -1}>{signedIn ? 'My Account' : 'Sign in'}</NavLink>
          {instagram && <a href={instagram} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>Instagram</a>}
        </nav>
      </aside>
    </div>
  );
}
