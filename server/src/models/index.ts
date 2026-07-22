import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPortfolioProfile extends Document {
  slug: string;
  displayName: string;
  ownerId?: Types.ObjectId;
  isPublished: boolean;
  isDefault: boolean;
  /** Opt-in: appear on the public /examples gallery when published */
  showInGallery: boolean;
  /** Soft-deleted portfolios sit in the bin until permanently removed */
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioProfileSchema = new Schema<IPortfolioProfile>(
  {
    /** Public path segment `/{slug}`. Uniqueness: per-owner among active portfolios; globally among published. */
    slug: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    isPublished: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    showInGallery: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

/** One active (non-binned) slug per editor — different users may share the same slug as drafts. */
portfolioProfileSchema.index(
  { ownerId: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null, ownerId: { $type: 'objectId' } },
  }
);

/** Only one published portfolio can claim a public `/{slug}` URL. */
portfolioProfileSchema.index(
  { slug: 1 },
  {
    unique: true,
    name: 'slug_published_unique',
    partialFilterExpression: { isPublished: true, deletedAt: null },
  }
);

portfolioProfileSchema.index(
  { showInGallery: 1, updatedAt: -1 },
  {
    name: 'gallery_examples',
    partialFilterExpression: { isPublished: true, showInGallery: true, deletedAt: null },
  }
);

export const PortfolioProfile = mongoose.model<IPortfolioProfile>('PortfolioProfile', portfolioProfileSchema);

export interface IProfileContent extends Document {
  portfolioProfileId: Types.ObjectId;
  name: string;
  title: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolioUrl: string;
  github: string;
  bio: string;
  yearsExperience: string;
  educationHighlight: string;
  profileImageUrl: string;
  resumeUrl: string;
  stats: { label: string; value: string }[];
  aiTools: string[];
  workedWith: { name: string; logoUrl?: string }[];
  testimonials: {
    quote: string;
    clientName: string;
    avatarUrl?: string;
    role?: string;
    order?: number;
  }[];
}

const profileContentSchema = new Schema<IProfileContent>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, unique: true, index: true },
  name: { type: String, default: '' },
  title: { type: String, default: '' },
  tagline: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  github: { type: String, default: '' },
  bio: { type: String, default: '' },
  yearsExperience: { type: String, default: '' },
  educationHighlight: { type: String, default: '' },
  profileImageUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  stats: [{ label: String, value: String }],
  aiTools: [String],
  workedWith: [{ name: String, logoUrl: String }],
  testimonials: [
    {
      quote: String,
      clientName: String,
      avatarUrl: String,
      role: String,
      order: { type: Number, default: 0 },
    },
  ],
});

export const ProfileContent = mongoose.model<IProfileContent>('ProfileContent', profileContentSchema);

export interface ISiteSettings extends Document {
  portfolioProfileId: Types.ObjectId;
  siteTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layoutMode: 'single-page' | 'multi-page';
  glassStyle: 'subtle' | 'medium' | 'strong';
  portfolioTheme: 'glass' | 'spotlight' | 'terminal' | 'command-center' | 'bento' | 'studio' | 'olive';
  sectionVisibility: Record<string, boolean>;
  analyticsId: string;
  showStats: boolean;
  showAiStrip: boolean;
  showTestimonials: boolean;
  showBlog: boolean;
  showNavHireMe: boolean;
  showSectionNumbers: boolean;
  showCursorGlow?: boolean;
  cursorEffect:
    | 'none'
    | 'spotlight'
    | 'glow'
    | 'follower'
    | 'radial-gradient'
    | 'lighting'
    | 'aura'
    | 'hover-spotlight';
  projectPreviewMode: 'image' | 'webview';
  projectWebviewSlowScroll: boolean;
  skillsDisplayStyle: 'chips' | 'rings' | 'bars' | 'cards';
  accessLockEnabled: boolean;
  /** bcrypt hash of visitor access code — never expose publicly */
  accessCodeHash: string;
  faviconStyle: 'auto' | 'photo' | 'initials';
}

const siteSettingsSchema = new Schema<ISiteSettings>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, unique: true, index: true },
  siteTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  ogImageUrl: { type: String, default: '' },
  accentColor: { type: String, default: '#6366f1' },
  primaryColor: { type: String, default: '#6366f1' },
  secondaryColor: { type: String, default: '#22d3ee' },
  fontFamily: { type: String, default: 'dm-sans' },
  layoutMode: { type: String, enum: ['single-page', 'multi-page'], default: 'single-page' },
  glassStyle: { type: String, enum: ['subtle', 'medium', 'strong'], default: 'medium' },
  portfolioTheme: { type: String, enum: ['glass', 'spotlight', 'terminal', 'command-center', 'bento', 'studio', 'olive'], default: 'glass' },
  sectionVisibility: { type: Map, of: Boolean, default: {} },
  analyticsId: { type: String, default: '' },
  showStats: { type: Boolean, default: true },
  showAiStrip: { type: Boolean, default: true },
  showTestimonials: { type: Boolean, default: false },
  showBlog: { type: Boolean, default: false },
  showNavHireMe: { type: Boolean, default: false },
  showSectionNumbers: { type: Boolean, default: false },
  showCursorGlow: { type: Boolean, default: false },
  cursorEffect: {
    type: String,
    enum: ['none', 'spotlight', 'glow', 'follower', 'radial-gradient', 'lighting', 'aura', 'hover-spotlight'],
    default: 'none',
  },
  projectPreviewMode: { type: String, enum: ['image', 'webview'], default: 'webview' },
  projectWebviewSlowScroll: { type: Boolean, default: false },
  skillsDisplayStyle: { type: String, enum: ['chips', 'rings', 'bars', 'cards'], default: 'chips' },
  accessLockEnabled: { type: Boolean, default: false },
  accessCodeHash: { type: String, default: '' },
  faviconStyle: { type: String, enum: ['auto', 'photo', 'initials'], default: 'auto' },
});

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);

export interface ISkillItem {
  name: string;
  level?: string;
  order: number;
}

export interface ISkillCategory extends Document {
  portfolioProfileId: Types.ObjectId;
  name: string;
  order: number;
  skills: ISkillItem[];
}

const skillCategorySchema = new Schema<ISkillCategory>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  skills: [{ name: String, level: String, order: Number }],
});

skillCategorySchema.index({ portfolioProfileId: 1, order: 1 });

export const SkillCategory = mongoose.model<ISkillCategory>('SkillCategory', skillCategorySchema);

export interface IJobProject {
  name: string;
  url: string;
  techStack: string[];
}

export interface IExperience extends Document {
  portfolioProfileId: Types.ObjectId;
  type: 'job' | 'internship';
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
  projects: IJobProject[];
  order: number;
}

const experienceSchema = new Schema<IExperience>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  type: { type: String, enum: ['job', 'internship'], default: 'job' },
  company: { type: String, required: true },
  role: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  bullets: [String],
  projects: [{ name: String, url: String, techStack: [String] }],
  order: { type: Number, default: 0 },
});

experienceSchema.index({ portfolioProfileId: 1, order: 1 });

export const Experience = mongoose.model<IExperience>('Experience', experienceSchema);

export interface IProject extends Document {
  portfolioProfileId: Types.ObjectId;
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  featured: boolean;
  isPersonalProject: boolean;
  order: number;
  startDate: string;
  endDate: string;
}

const projectSchema = new Schema<IProject>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  techStack: [String],
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  isPersonalProject: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
});

projectSchema.index({ portfolioProfileId: 1, order: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);

export interface IEducation extends Document {
  portfolioProfileId: Types.ObjectId;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  cgpa: string;
  status: string;
  /** External link (degree portal, marksheet, appreciation letter, etc.) */
  url: string;
  /** Screenshot or document (image/PDF) for the degree / marksheet */
  imageUrl: string;
  order: number;
}

const educationSchema = new Schema<IEducation>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  degree: { type: String, required: true },
  institution: { type: String, default: '' },
  location: { type: String, default: '' },
  startYear: { type: String, default: '' },
  endYear: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  status: { type: String, default: '' },
  url: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

educationSchema.index({ portfolioProfileId: 1, order: 1 });

export const Education = mongoose.model<IEducation>('Education', educationSchema);

export interface ICertification extends Document {
  portfolioProfileId: Types.ObjectId;
  name: string;
  issuer: string;
  year: string;
  url: string;
  /** Screenshot or document (image/PDF) URL for the certificate */
  imageUrl: string;
  order: number;
}

const certificationSchema = new Schema<ICertification>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  year: { type: String, default: '' },
  url: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

certificationSchema.index({ portfolioProfileId: 1, order: 1 });

export const Certification = mongoose.model<ICertification>('Certification', certificationSchema);

export interface IContactMessage extends Document {
  portfolioProfileId: Types.ObjectId;
  name: string;
  email: string;
  message: string;
  read: boolean;
  archived: boolean;
  /** Conversation-level pin (mirrored on all messages for that email). */
  pinned: boolean;
  pinnedAt?: Date | null;
  /** Marked as contacted / followed up. */
  contacted: boolean;
  createdAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  pinnedAt: { type: Date, default: null },
  contacted: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

contactMessageSchema.index({ portfolioProfileId: 1, email: 1, createdAt: -1 });

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);

export interface IMediaAsset extends Document {
  portfolioProfileId: Types.ObjectId;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  /** local | cloudinary | s3 */
  provider?: string;
  /** Provider object key / public_id for deletion */
  storageKey?: string;
  uploadedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', required: true, index: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, default: '' },
  size: { type: Number, default: 0 },
  provider: { type: String, default: 'local' },
  storageKey: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

export const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema);

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  /** Billing plan — updated after Stripe / Razorpay checkout */
  plan: 'free' | 'pro' | 'premium' | 'domain' | 'team';
  planBilling?: 'monthly' | 'yearly' | null;
  planCurrency?: 'usd' | 'inr' | null;
  planActivatedAt?: Date | null;
  /** Saved checkout intents (synced from client cart) */
  cart?: {
    id: string;
    planId: 'pro' | 'premium' | 'domain';
    billing: 'monthly' | 'yearly';
    currency: 'usd' | 'inr';
    addedAt: number;
  }[];
  /** Free tier: one successful resume parse lifetime */
  resumeImportUsed: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema(
  {
    id: { type: String, required: true },
    planId: { type: String, enum: ['pro', 'premium', 'domain'], required: true },
    billing: { type: String, enum: ['monthly', 'yearly'], required: true },
    currency: { type: String, enum: ['usd', 'inr'], required: true },
    addedAt: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: '' },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium', 'domain', 'team'],
      default: 'free',
    },
    planBilling: { type: String, enum: ['monthly', 'yearly'], default: null },
    planCurrency: { type: String, enum: ['usd', 'inr'], default: null },
    planActivatedAt: { type: Date, default: null },
    cart: { type: [cartItemSchema], default: [] },
    resumeImportUsed: { type: Boolean, default: false },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
}

const adminUserSchema = new Schema<IAdminUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', adminUserSchema);

export interface IActivityLog extends Document {
  portfolioProfileId?: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  portfolioProfileId: { type: Schema.Types.ObjectId, ref: 'PortfolioProfile', index: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

/** Public folio page view (one row per successful public aggregate load). */
export interface IPortfolioPageView extends Document {
  portfolioProfileId: Types.ObjectId;
  createdAt: Date;
}

const portfolioPageViewSchema = new Schema<IPortfolioPageView>({
  portfolioProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'PortfolioProfile',
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

portfolioPageViewSchema.index({ portfolioProfileId: 1, createdAt: -1 });

export const PortfolioPageView = mongoose.model<IPortfolioPageView>(
  'PortfolioPageView',
  portfolioPageViewSchema
);

/** Singleton platform-managed seed for public /try and theme demos. */
export interface ITryDemoSeed extends Document {
  key: string;
  version: number;
  themeId: string;
  content: Record<string, string>;
  skills: unknown[];
  experiences: unknown[];
  projects: unknown[];
  education: unknown[];
  certifications: unknown[];
  workedWith: unknown[];
  testimonials: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const tryDemoSeedSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    version: { type: Number, default: 5 },
    themeId: {
      type: String,
      enum: ['glass', 'spotlight', 'terminal', 'command-center', 'bento', 'studio', 'olive'],
      default: 'studio',
    },
    content: { type: Schema.Types.Mixed, default: {} },
    skills: { type: [Schema.Types.Mixed], default: [] },
    experiences: { type: [Schema.Types.Mixed], default: [] },
    projects: { type: [Schema.Types.Mixed], default: [] },
    education: { type: [Schema.Types.Mixed], default: [] },
    certifications: { type: [Schema.Types.Mixed], default: [] },
    workedWith: { type: [Schema.Types.Mixed], default: [] },
    testimonials: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export const TryDemoSeed = mongoose.model<ITryDemoSeed>('TryDemoSeed', tryDemoSeedSchema);
