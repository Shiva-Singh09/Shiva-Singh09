/*
 * aboutContent — centralized factual About content.
 * No invented achievements, experience, clients, or metrics.
 * Voice-over text mirrors the on-page introduction exactly.
 */
export const aboutIntro = {
  greeting: "Hi, I'm Shiva Singh.",
  role: 'Full-Stack Developer & AI Engineer',
  bio: "I'm a B.Tech CSE-AI student from Lucknow, India. I build practical, usable software products end to end — from APIs and databases to clean user interfaces — and I integrate AI/ML where it genuinely adds value.",
  pillars: [
    'Full-stack development',
    'Backend & system design',
    'AI/ML integration',
    'Practical software products',
  ],
  // Read verbatim by the optional voice-over (Web Speech API, no audio file).
  voiceScript:
    "Hi, I'm Shiva Singh. I'm a Full-Stack Developer and AI Engineer. I'm a B.Tech Computer Science and Artificial Intelligence student from Lucknow, India. I build practical, usable software products end to end — from APIs and databases to clean user interfaces — and I integrate AI and machine learning where it genuinely adds value.",
  techGroups: [
    {
      category: 'FULL-STACK',
      items: ['React', 'Node.js', 'Express.js', 'Next.js'],
    },
    {
      category: 'AI / ML',
      items: ['Python', 'PyTorch', 'GenAI tools'],
    },
    {
      category: 'DATABASE',
      items: ['MongoDB', 'PostgreSQL', 'Supabase'],
    },
    {
      category: 'TOOLS',
      items: ['Git', 'GitHub', 'VS Code', 'Vercel'],
    },
  ],
  closing:
    "I don't just want to build software. I want to build things people can actually use.",
}
