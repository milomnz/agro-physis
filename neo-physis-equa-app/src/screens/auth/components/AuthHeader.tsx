import BrandHero from '../../../components/BrandHero';

interface AuthHeaderProps {
  subtitle: string;
}

/** Héroe de las pantallas de acceso: marca pública (Agro Physis) y su lema. */
export default function AuthHeader({ subtitle }: AuthHeaderProps) {
  return (
    <BrandHero bleed eyebrow="Ciencia y datos para el campo" title="Agro Physis" subtitle={subtitle} />
  );
}
