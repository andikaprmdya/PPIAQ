export type Language = 'id' | 'en';

export interface NavLink {
  label: { id: string; en: string };
  href: string;
}

export interface Team {
  id: string;
  name: string;
  role: { id: string; en: string };
  university: { id: string; en: string };
  email: string;
  instagram: string;
  image: string;
}

export interface Event {
  id: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  date: string;
  location: string;
  image: string;
}
