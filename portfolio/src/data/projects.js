/*
 * Projects data — factual, sourced from the existing profile.
 * Links are only included when the exact URL is known; otherwise the
 * component renders the project without a fabricated link.
 */
export const projects = [
  {
    id: 'landology',
    title: 'LANDLOGY',
    tagline: 'Real-estate platform for sellers, brokers and customers.',
    description:
      'A unified marketplace where sellers list properties, brokers manage deals, and customers search and enquire — all in one place.',
    tech: ['React', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL'],
    role: 'Full technical lead — frontend, backend, database, auth and APIs.',
    status: 'in-development',
    links: { live: null, github: null },
  },
  {
    id: 'shilpsaathi',
    title: 'ShilpSaathi',
    tagline: 'AI-assisted marketplace that helps artisans sell online.',
    description:
      'A team project that makes listing artisan products easier for non-tech users. Uses AI to remove image backgrounds and upscale product photos, with a voice-input listing flow.',
    tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'FastAPI', 'PyTorch', 'OpenCV'],
    role: 'Full-stack development — frontend, backend, REST APIs, database, AI/ML integration.',
    status: 'live',
    links: { live: null, github: null },
  },
  {
    id: 'smm-panel',
    title: 'SMM Panel',
    tagline: 'Social media marketing platform with automated order processing.',
    description:
      'A platform where users place orders for social-media services, manage a wallet, and pay securely. Orders are processed automatically by background workers with retry and recovery on failure.',
    tech: ['Next.js', 'TypeScript', 'MongoDB', 'Razorpay'],
    role: 'Project Owner & Technical Lead.',
    status: 'live',
    links: { live: null, github: null },
  },
  {
    id: 'teetalks',
    title: 'TeaTalks',
    tagline: 'Anonymous student discussion platform with AI moderation.',
    description:
      'A space where students post, comment, vote in polls and report content anonymously. Moderation blends rule-based NLP with AI, with a safe fallback if either layer fails.',
    tech: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'JWT', 'Groq'],
    role: 'Backend & AI-moderation lead — built from scratch.',
    status: 'live',
    links: {
      live: 'https://teetalks-six.vercel.app/',
      github: 'https://github.com/Shiva-Singh09/teetalks',
    },
  },
  {
    id: 'campus-complaints',
    title: 'Campus Complaint Management System',
    tagline: 'Role-based complaint portal for students and administrators.',
    description:
      'A platform where students raise complaints and admins manage and resolve them through separate, role-specific workflows.',
    tech: ['Node.js', 'Express.js', 'MongoDB', 'JWT'],
    role: 'Backend architecture — APIs, database, auth and the full complaint lifecycle.',
    status: 'live',
    links: { live: null, github: null },
  },
]
