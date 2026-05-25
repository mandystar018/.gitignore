import { KeywordCategory } from '../types';

export interface SuggestedKeyword {
  keyword: string;
  category: KeywordCategory;
  description: string;
}

export const photographyKeywords: SuggestedKeyword[] = [
  // Portrait
  { keyword: 'portrait photography', category: 'portrait', description: 'Studio and lifestyle portrait sessions' },
  { keyword: 'headshot photographer', category: 'portrait', description: 'Professional headshots for business' },
  { keyword: 'senior portraits', category: 'portrait', description: 'High school senior photo sessions' },
  { keyword: 'professional portraits', category: 'portrait', description: 'Business and professional portrait sessions' },
  { keyword: 'lifestyle portrait session', category: 'portrait', description: 'Relaxed, natural portrait photography' },

  // Wedding
  { keyword: 'wedding photographer', category: 'wedding', description: 'Wedding photography services' },
  { keyword: 'engagement photos', category: 'wedding', description: 'Engagement session photography' },
  { keyword: 'wedding photography tips', category: 'wedding', description: 'Blog content about wedding photography' },
  { keyword: 'bridal portraits', category: 'wedding', description: 'Bridal session photography' },
  { keyword: 'wedding day timeline', category: 'wedding', description: 'Blog posts about wedding day planning' },

  // Family
  { keyword: 'family portraits', category: 'family', description: 'Family photo sessions' },
  { keyword: 'family photographer', category: 'family', description: 'Professional family photography' },
  { keyword: 'outdoor family photos', category: 'family', description: 'Outdoor family portrait sessions' },
  { keyword: 'holiday mini sessions', category: 'family', description: 'Seasonal mini photo sessions' },

  // Newborn
  { keyword: 'newborn photography', category: 'newborn', description: 'Newborn baby photo sessions' },
  { keyword: 'maternity photos', category: 'newborn', description: 'Maternity photography sessions' },
  { keyword: 'baby photographer', category: 'newborn', description: 'Baby milestone photography' },
  { keyword: 'newborn posing tips', category: 'newborn', description: 'Blog content about newborn photography' },
  { keyword: 'milestone photos', category: 'newborn', description: 'Baby milestone photo sessions' },

  // Event
  { keyword: 'event photographer', category: 'event', description: 'Corporate and private event photography' },
  { keyword: 'corporate event photography', category: 'event', description: 'Business event photo coverage' },
  { keyword: 'birthday photography', category: 'event', description: 'Birthday party photo sessions' },

  // Editing
  { keyword: 'Lightroom presets', category: 'editing', description: 'Photo editing presets and tutorials' },
  { keyword: 'photo editing tips', category: 'editing', description: 'Post-processing tutorials' },
  { keyword: 'photo retouching', category: 'editing', description: 'Portrait retouching services' },
  { keyword: 'Photoshop tutorial', category: 'editing', description: 'Photoshop editing blog posts' },
  { keyword: 'culling photos', category: 'editing', description: 'Photo culling workflow tips' },

  // General
  { keyword: 'photography tips', category: 'general', description: 'General photography advice' },
  { keyword: 'golden hour photography', category: 'general', description: 'Outdoor golden hour sessions' },
  { keyword: 'natural light photography', category: 'general', description: 'Natural light shooting techniques' },
  { keyword: 'camera settings for portraits', category: 'general', description: 'Photography camera tutorials' },
  { keyword: 'photography blog', category: 'general', description: 'Photography blog content' },
  { keyword: 'best camera for photography', category: 'general', description: 'Camera gear recommendation posts' },
  { keyword: 'posing tips for photos', category: 'general', description: 'Client posing guide content' },

  // Business
  { keyword: 'photography pricing', category: 'business', description: 'Photography pricing and packages' },
  { keyword: 'photography packages', category: 'business', description: 'Session packages and pricing' },
  { keyword: 'book a photographer', category: 'business', description: 'Booking call-to-action keywords' },
  { keyword: 'photography portfolio', category: 'business', description: 'Portfolio showcase content' },
  { keyword: 'photography contract', category: 'business', description: 'Business and legal content for photographers' },
  { keyword: 'second shooter', category: 'business', description: 'Second shooter availability content' },
];

export const categoryLabels: Record<KeywordCategory, string> = {
  portrait: 'Portrait',
  wedding: 'Wedding',
  family: 'Family',
  newborn: 'Newborn',
  event: 'Event',
  general: 'General',
  editing: 'Editing',
  business: 'Business',
  custom: 'Custom',
};

export const categoryColors: Record<KeywordCategory, string> = {
  portrait: '#C4714A',
  wedding: '#9B6B9B',
  family: '#4A8FAA',
  newborn: '#E8824A',
  event: '#D4615A',
  general: '#5B8A5B',
  editing: '#4A7BAA',
  business: '#7D9B76',
  custom: '#A08070',
};
