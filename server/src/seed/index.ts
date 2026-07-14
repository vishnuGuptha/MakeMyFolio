import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  AdminUser,
  User,
  PortfolioProfile,
  ProfileContent,
  SiteSettings,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
  TryDemoSeed,
} from '../models/index.js';
import { getDefaultTryDemoSeed } from '../data/defaultTryDemoSeed.js';

const BIO =
  'I am a Frontend Engineer with 4.8 years of experience building scalable web and mobile applications using React.js, Next.js, TypeScript, and React Native. I have developed enterprise applications with strong focus on REST API integration, state management, testing, and performance optimization.\n\nI leverage AI-assisted development tools including GitHub Copilot, Cursor AI, and OpenAI Codex to accelerate delivery, debugging, documentation, and code reviews. I am currently pursuing an Executive M.Tech in Artificial Intelligence & Data Science from IIT Patna.';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio-cms';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding');

  await Promise.all([
    AdminUser.deleteMany({}),
    User.deleteMany({}),
    PortfolioProfile.deleteMany({}),
    ProfileContent.deleteMany({}),
    SiteSettings.deleteMany({}),
    SkillCategory.deleteMany({}),
    Experience.deleteMany({}),
    Project.deleteMany({}),
    Education.deleteMany({}),
    Certification.deleteMany({}),
    TryDemoSeed.deleteMany({}),
  ]);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await AdminUser.create({ email: adminEmail, passwordHash });
  console.log(`Platform admin created: ${adminEmail}`);

  const userPasswordHash = await bcrypt.hash('user123', 12);
  const demoUser = await User.create({
    email: 'vishnugupta28899@gmail.com',
    passwordHash: userPasswordHash,
    name: 'Vishnu Gupta',
  });
  console.log(`Demo user created: vishnugupta28899@gmail.com / user123`);

  const profile = await PortfolioProfile.create({
    slug: 'vishnu-gupta',
    displayName: 'Vishnu Gupta',
    ownerId: demoUser._id,
    isPublished: true,
    isDefault: true,
  });

  const profileId = profile._id;

  await ProfileContent.create({
    portfolioProfileId: profileId,
    name: 'Vishnu Gupta',
    title: 'Frontend & Full Stack Engineer',
    tagline:
      'React.js · Next.js · React Native · Node.js · TypeScript · AI-Assisted Development · 4.8+ Years',
    location: 'Bengaluru',
    phone: '9380661940',
    email: 'vishnugupta28899@gmail.com',
    linkedin: 'https://linkedin.com/in/vishnukumargupta',
    portfolioUrl: 'https://vishnudev.netlify.app/',
    github: '',
    bio: BIO,
    yearsExperience: '4.8+',
    educationHighlight: 'Executive M.Tech in AI & Data Science — IIT Patna (2025–2027)',
    stats: [
      { label: 'Years Experience', value: '4.8+' },
      { label: 'REST APIs Integrated', value: '25+' },
      { label: 'Projects Shipped', value: '10+' },
      { label: 'Enterprise Apps', value: '5+' },
    ],
    aiTools: ['Cursor AI', 'GitHub Copilot', 'OpenAI Codex', 'ChatGPT'],
  });

  await SiteSettings.create({
    portfolioProfileId: profileId,
    siteTitle: 'Vishnu Gupta | Frontend & Full Stack Engineer',
    metaDescription:
      'Portfolio of Vishnu Gupta — Frontend & Full Stack Engineer specializing in React, Next.js, TypeScript, React Native, and AI-assisted development.',
    accentColor: '#6366f1',
    primaryColor: '#6366f1',
    secondaryColor: '#22d3ee',
    fontFamily: 'dm-sans',
    layoutMode: 'single-page',
    glassStyle: 'medium',
    showStats: true,
    showAiStrip: true,
    showTestimonials: false,
    showBlog: false,
    sectionVisibility: {
      hero: true,
      about: true,
      skills: true,
      experience: true,
      internships: true,
      featuredProjects: true,
      personalProjects: true,
      education: true,
      certifications: true,
      contact: true,
    },
  });

  const skillCategories = [
    {
      name: 'Languages',
      order: 0,
      skills: [
        { name: 'JavaScript', order: 0 },
        { name: 'TypeScript', order: 1 },
        { name: 'HTML', order: 2 },
      ],
    },
    {
      name: 'Frameworks',
      order: 1,
      skills: [
        { name: 'React.js', order: 0 },
        { name: 'Next.js', order: 1 },
        { name: 'Angular.js', order: 2 },
        { name: 'Node.js', order: 3 },
        { name: 'Express.js', order: 4 },
      ],
    },
    {
      name: 'Styling',
      order: 2,
      skills: [
        { name: 'Tailwind CSS', order: 0 },
        { name: 'Mantine', order: 1 },
        { name: 'Bootstrap', order: 2 },
        { name: 'Styled Components', order: 3 },
        { name: 'SCSS', order: 4 },
        { name: 'CSS', order: 5 },
      ],
    },
    {
      name: 'Mobile',
      order: 3,
      skills: [
        { name: 'React Native', order: 0 },
        { name: 'React Native CLI', order: 1 },
        { name: 'Expo', order: 2 },
        { name: 'React Navigation', order: 3 },
        { name: 'Gradle', order: 4 },
      ],
    },
    {
      name: 'State Management',
      order: 4,
      skills: [
        { name: 'Redux', order: 0 },
        { name: 'Redux Toolkit', order: 1 },
        { name: 'RTK Query', order: 2 },
        { name: 'MobX', order: 3 },
        { name: 'Context API', order: 4 },
      ],
    },
    {
      name: 'Versioning',
      order: 5,
      skills: [
        { name: 'Git', order: 0 },
        { name: 'GitHub', order: 1 },
        { name: 'BitBucket', order: 2 },
        { name: 'AWS CodeCommit', order: 3 },
        { name: 'Azure Repos', order: 4 },
      ],
    },
    {
      name: 'Testing',
      order: 6,
      skills: [
        { name: 'Jest', order: 0 },
        { name: 'React Testing Library', order: 1 },
      ],
    },
    {
      name: 'Others',
      order: 7,
      skills: [
        { name: 'RESTful APIs', order: 0 },
        { name: 'Project Management', order: 1 },
        { name: 'Web Applications', order: 2 },
        { name: 'Mobile Applications', order: 3 },
      ],
    },
  ];

  for (const cat of skillCategories) {
    await SkillCategory.create({ portfolioProfileId: profileId, ...cat });
  }

  const experiences = [
    {
      type: 'job' as const,
      company: 'Algoleap',
      role: 'Software Engineer',
      location: '',
      startDate: 'Dec 2025',
      endDate: 'Present',
      isCurrent: true,
      order: 0,
      bullets: [
        'Developed reusable React.js components for enterprise applications ensuring responsive user experiences.',
        'Leveraged Cursor AI, GitHub Copilot, ChatGPT and OpenAI Codex to accelerate feature development, debugging, documentation and unit testing.',
        'Collaborated with cross-functional teams to deliver features within Agile sprints.',
        'Using Cursor, Codex efficiently to fast track the dev cycle.',
      ],
      projects: [
        {
          name: 'Responsive (RFPIO) - Reusable Trust Centers',
          url: 'https://www.responsive.io/',
          techStack: ['React.js'],
        },
      ],
    },
    {
      type: 'job' as const,
      company: 'Aritha Consulting Services Pvt. Ltd.',
      role: 'Software Engineer',
      location: '',
      startDate: 'Feb 2024',
      endDate: 'Dec 2025',
      isCurrent: false,
      order: 1,
      bullets: [
        'Developed reusable React.js components reducing duplicate code and improving maintainability.',
        'Integrated 25+ REST APIs with React and Node.js applications.',
        'Built responsive web and mobile features for UK-based Tax Filing application.',
        'Integrated Apache Superset dashboards into Angular applications for business analytics.',
      ],
      projects: [
        { name: 'Tax In Minutes', url: 'https://www.taxd.co.uk/', techStack: ['ReactJS', 'React Native'] },
        { name: 'GoAudits', url: 'https://goaudits.com/', techStack: ['ReactJS', 'Angular', 'Superset'] },
        { name: 'Sposea', url: 'https://www.sposea.com/', techStack: ['ReactJS', 'Superset'] },
        { name: 'PEX (Mediatek)', url: 'https://www.mediatek.com/', techStack: ['ReactJS', 'Payload CMS'] },
      ],
    },
    {
      type: 'job' as const,
      company: 'Infogain',
      role: 'Software Engineer G2',
      location: '',
      startDate: 'Dec 2021',
      endDate: 'Feb 2024',
      isCurrent: false,
      order: 2,
      bullets: [
        'Developed and maintained dynamic web applications using Next JS, enhancing user experience by 30% and improving application performance by 25%.',
        'Collaborated closely with QA teams, ensuring comprehensive testing, troubleshooting and reducing production bugs by 20%.',
        'Collaborated with UI/UX teams to implement visually appealing and user-friendly interfaces, increasing user satisfaction by 35%.',
        'Applied best practices and stayed up to date with the latest industry trends, resulting in a 25% improvement in application performance.',
      ],
      projects: [
        { name: 'Chefsteps', url: 'https://www.chefsteps.com/', techStack: ['NextJS', 'SCSS'] },
      ],
    },
    {
      type: 'internship' as const,
      company: 'BlessedBuy',
      role: 'Web Dev & WordPress',
      location: '',
      startDate: 'Nov 2019',
      endDate: 'Oct 2020',
      isCurrent: false,
      order: 3,
      bullets: [
        'Used WordPress shopkeeper theme, WooCommerce plugin.',
        'Led a team of 8 interns during my internship period.',
        'Contributed to changing the theme from Shopkeeper to Dukaan, automating emails for order process.',
      ],
      projects: [
        { name: 'BlessdBuy.com', url: 'https://www.blessdbuy.com/', techStack: ['WordPress', 'WooCommerce'] },
      ],
    },
    {
      type: 'internship' as const,
      company: 'Share-It',
      role: 'Android Dev & QA',
      location: '',
      startDate: 'Mar 2020',
      endDate: 'Jun 2020',
      isCurrent: false,
      order: 4,
      bullets: [
        'Short video mobile application like TikTok.',
        'Connected with designers and testing personnel, took reviews, worked on enhancements of the application.',
      ],
      projects: [
        { name: 'Share-it', url: '', techStack: ['Android', 'iOS'] },
      ],
    },
  ];

  for (const exp of experiences) {
    await Experience.create({ portfolioProfileId: profileId, ...exp });
  }

  const projects = [
    {
      title: 'Rag Agent - AI Document Q&A Platform',
      description:
        'Built a RAG-based document Q&A platform with upload, embedding, vector search, and cited streaming chat. Developed Node.js/Express API with MongoDB Atlas, multi-format parsing, and OpenAI/Gemini integration.',
      techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'OpenAI'],
      liveUrl: 'https://doclensai.vercel.app/',
      githubUrl: '',
      featured: true,
      isPersonalProject: true,
      order: 0,
      startDate: 'Feb 2026',
      endDate: 'Present',
    },
    {
      title: 'Personal Portfolio',
      description:
        'Used React.js with TSX to create a fully responsive and colorful Portfolio Platform. Integrated a TIDIO ChatBot for easier communication.',
      techStack: ['ReactJS', 'Redux', 'JavaScript', 'TIDIO'],
      liveUrl: 'https://vishnudev.netlify.app/',
      githubUrl: '',
      featured: true,
      isPersonalProject: true,
      order: 1,
      startDate: 'Jun 2024',
      endDate: 'Aug 2024',
    },
    {
      title: 'E-commerce Portal (QKart)',
      description:
        'Developed an e-commerce application offering a wide range of products. Implemented user authentication, shopping cart, and checkout workflows with responsive design.',
      techStack: ['ReactJS', 'Redux', 'JavaScript', 'NodeJS', 'ExpressJS'],
      liveUrl: 'https://dopekart.netlify.app/',
      githubUrl: '',
      featured: false,
      isPersonalProject: true,
      order: 2,
      startDate: 'Feb 2024',
      endDate: 'Jun 2024',
    },
    {
      title: 'Trip Trekker',
      description:
        'Built responsive web pages from wireframes using HTML, CSS, Bootstrap. Implemented navigation, hero section, and responsive grids with hover effects.',
      techStack: ['ReactJS', 'Context API', 'TypeScript', 'Bootstrap', 'MUI'],
      liveUrl: 'https://triptrekker.netlify.app/',
      githubUrl: '',
      featured: false,
      isPersonalProject: true,
      order: 3,
      startDate: 'Aug 2022',
      endDate: 'Aug 2023',
    },
  ];

  for (const proj of projects) {
    await Project.create({ portfolioProfileId: profileId, ...proj });
  }

  const education = [
    {
      degree: 'Masters of Technology (Executive M.Tech) – Artificial Intelligence & Data Science',
      institution: 'Indian Institute of Technology, Patna',
      location: 'Karnataka, India',
      startYear: '2025',
      endYear: '2027',
      cgpa: 'To be Announced',
      status: 'In Progress',
      order: 0,
    },
    {
      degree: 'Bachelor of Engineering (B.E) – Computer Science',
      institution: 'M.S Engineering College',
      location: 'Bengaluru, Karnataka, India',
      startYear: '2017',
      endYear: '2021',
      cgpa: '7.5',
      status: 'Completed',
      order: 1,
    },
  ];

  for (const edu of education) {
    await Education.create({ portfolioProfileId: profileId, ...edu });
  }

  const certifications = [
    { name: 'MERN Full Stack', issuer: 'Crio.do', year: '', url: '', imageUrl: '', order: 0 },
    { name: 'JavaScript & React.js Skill Badges', issuer: 'LinkedIn', year: '', url: '', imageUrl: '', order: 1 },
    { name: 'C, C++ & Java Certification', issuer: 'IIT Bombay', year: '', url: '', imageUrl: '', order: 2 },
  ];

  for (const cert of certifications) {
    await Certification.create({ portfolioProfileId: profileId, ...cert });
  }

  const tryDemo = getDefaultTryDemoSeed();
  await TryDemoSeed.create({
    key: 'default',
    version: tryDemo.version,
    themeId: tryDemo.themeId,
    content: tryDemo.content,
    skills: tryDemo.skills,
    experiences: tryDemo.experiences,
    projects: tryDemo.projects,
    education: tryDemo.education,
    certifications: tryDemo.certifications,
    workedWith: tryDemo.workedWith,
    testimonials: tryDemo.testimonials,
  });
  console.log('Try demo seed created (Alex Rivera)');

  console.log('Seed complete!');
  console.log(`Default profile: /p/vishnu-gupta`);
  console.log(`Platform admin login: ${adminEmail} / ${adminPassword}`);
  console.log(`User login: vishnugupta28899@gmail.com / user123`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
