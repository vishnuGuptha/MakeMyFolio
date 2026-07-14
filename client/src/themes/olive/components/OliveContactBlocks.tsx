import { FileText, Globe, Linkedin, Mail, Github, Phone } from 'lucide-react';
import { getSocialLinks } from '@/themes/shared/SocialIconLinks';
import type { Certification, ProfileContent } from '@/types';

function isDocumentUrl(url: string) {
  return /\.(pdf|docx?|pptx?)$/i.test(url.split('?')[0] || '');
}

export function OliveContactLinks({ content }: { content: ProfileContent }) {
  const links = getSocialLinks(content, { includePhone: true });

  const iconFor = (id: string) => {
    switch (id) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5" strokeWidth={1.6} />;
      case 'github':
        return <Github className="h-5 w-5" strokeWidth={1.6} />;
      case 'email':
        return <Mail className="h-5 w-5" strokeWidth={1.6} />;
      case 'phone':
        return <Phone className="h-5 w-5" strokeWidth={1.6} />;
      default:
        return <Globe className="h-5 w-5" strokeWidth={1.6} />;
    }
  };

  const labelFor = (id: string, href: string) => {
    if (id === 'email') return content.email;
    if (id === 'phone') return content.phone;
    if (id === 'portfolio') return href.replace(/^https?:\/\//, '');
    if (id === 'linkedin') return 'LinkedIn';
    if (id === 'github') return 'GitHub';
    return href;
  };

  if (!links.length) {
    return (
      <div className="olive-contact-panel">
        <p className="text-sm text-white/90">Add email, LinkedIn, or portfolio URL in Profile & Hero.</p>
      </div>
    );
  }

  return (
    <div className="olive-contact-panel">
      <div className="olive-contact-grid">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className="olive-contact-item"
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            {iconFor(link.id)}
            <span>{labelFor(link.id, link.href)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function OliveCertBadges({ certifications }: { certifications: Certification[] }) {
  const sorted = [...(certifications || [])].sort((a, b) => a.order - b.order);
  if (!sorted.length) return null;

  return (
    <div className="olive-cert-panel">
      {sorted.map((cert) => {
        const href = cert.url || cert.imageUrl || '';
        const media = cert.imageUrl?.trim();
        const isDoc = media ? isDocumentUrl(media) : false;

        const thumb = media && !isDoc ? (
          <img src={media} alt={cert.name} className="olive-cert-badge" />
        ) : media && isDoc ? (
          <div className="olive-cert-fallback olive-cert-doc" aria-hidden>
            <FileText className="h-6 w-6" strokeWidth={1.5} />
          </div>
        ) : (
          <div className="olive-cert-fallback">{(cert.name || 'C').slice(0, 2).toUpperCase()}</div>
        );

        const inner = (
          <>
            {thumb}
            <span className="olive-cert-name">{cert.name}</span>
            {cert.issuer && <span className="olive-cert-meta">{cert.issuer}</span>}
            {cert.year && <span className="olive-cert-meta">{cert.year}</span>}
          </>
        );

        return href ? (
          <a
            key={cert._id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="olive-cert-item"
          >
            {inner}
          </a>
        ) : (
          <div key={cert._id} className="olive-cert-item">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
