// src/data/services.ts

export type ServiceStatus = 'live' | 'soon' | 'new'

export interface Service {
  slug: string
  name: string
  price: string
  description: string
  pillar: 1 | 2 | 3 | 4 | 5
  status?: ServiceStatus
  featured?: boolean
  /** Optional hero/card image (public path or allowed remote URL). */
  image?: string
  /** When set, "View details" links here instead of `/services/[slug]`. */
  primaryHref?: string
}

export const PILLARS = {
  1: { name: 'Web, brand & digital',    color: 'blue',   slug: 'web-brand'       },
  2: { name: 'Business setup & legal',  color: 'blue',   slug: 'business-setup'  },
  3: { name: 'SaaS & software',         color: 'amber',  slug: 'saas-products'   },
  4: { name: 'AI & automation',         color: 'purple', slug: 'ai-automation'   },
  5: { name: 'Alpha Freight Network',   color: 'green',  slug: 'freight'         },
} as const

export const SERVICES: Service[] = [
  // ── Pillar 1 ─────────────────────────────────────────────────────
  { pillar: 1, slug: 'custom-web-development',        name: 'Custom web development',           price: 'from $349',      description: '',       featured: true,  image: 'https://i.pinimg.com/736x/1b/ac/2a/1bac2a596fae3af2080a7352a67c609a.jpg' },
  { pillar: 1, slug: 'mobile-app-development',        name: 'Mobile app development',           price: 'from $1,499',    description: '',     featured: true,  image: 'https://i.pinimg.com/736x/c1/4e/7a/c14e7a22c44162033769d7f046513469.jpg' },
  { pillar: 1, slug: 'ecommerce-development',         name: 'E-commerce development',           price: 'from $999',      description: '',       featured: true,  image: 'https://i.pinimg.com/736x/a4/e3/e8/a4e3e865e95733a884183957eeee993c.jpg' },
  { pillar: 1, slug: 'shopify-setup',                 name: 'Shopify template setup',           price: '$199 flat',      description: '',       status: 'new'   },
  { pillar: 1, slug: 'ui-ux-design',                  name: 'UI/UX design',                     price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'product-design-prototyping',    name: 'Product design & prototyping',     price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'seo-optimization',              name: 'SEO optimization',                 price: 'from $199/mo', description: ''                    },
  { pillar: 1, slug: 'digital-marketing',             name: 'Digital marketing management',     price: 'from $299/mo', description: ''                    },
  { pillar: 1, slug: 'google-business-profile',       name: 'Google Business Profile mgmt',     price: '$149/mo',        description: '',         status: 'new'   },
  { pillar: 1, slug: 'social-media-ai-content',       name: 'Social media AI content',          price: '$399/mo', description: ''                         },
  { pillar: 1, slug: 'video-editing-youtube',         name: 'Video editing & YouTube mgmt',     price: '$299/mo',        description: '',         status: 'new'   },
  { pillar: 1, slug: 'tiktok-reels-content',          name: 'TikTok & Reels content',           price: '$199/mo',        description: '',         status: 'new'   },
  { pillar: 1, slug: 'reputation-management',         name: 'Reputation management',            price: '$199/mo',        description: '',         status: 'new'   },
  { pillar: 1, slug: 'business-email-setup',          name: 'Business email setup (Google)',    price: '$99 setup',      description: '',       status: 'new'   },
  { pillar: 1, slug: 'cold-email-outreach',           name: 'Cold email outreach setup',        price: '$299 flat',      description: '',       status: 'new'   },
  { pillar: 1, slug: 'app-maintenance',               name: 'App maintenance & support',        price: 'from $99/mo', description: ''                     },
  { pillar: 1, slug: 'performance-optimization',      name: 'Performance optimization',         price: 'from $499', description: ''                       },
  { pillar: 1, slug: 'digital-transformation',        name: 'Digital transformation consulting',price: '$99/session', description: ''                     },
  { pillar: 1, slug: 'backend-development',           name: 'Backend development',              price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'cloud-devops',                  name: 'Cloud & DevOps',                   price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'system-architecture',           name: 'System architecture design',       price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'database-design',               name: 'Database design & optimization',   price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'api-development',               name: 'API development & integrations',   price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'crm-erp',                       name: 'CRM & ERP integration',            price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'security-compliance',           name: 'Security & compliance',            price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'qa-testing',                    name: 'QA & software testing',            price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'low-code-no-code',              name: 'Low-code / no-code solutions',     price: 'get quote', description: ''                       },
  { pillar: 1, slug: 'analytics-bi',                  name: 'Analytics & business intelligence',price: 'get quote', description: ''                       },

  // ── Pillar 2 ─────────────────────────────────────────────────────
  { pillar: 2, slug: 'llc-registration',              name: 'LLC registration (US)',            price: '$299 flat',      description: '',       featured: true,  image: 'https://i.pinimg.com/736x/7e/4f/9b/7e4f9bac8aec21f2da037d75b347e9ad.jpg' },
  { pillar: 2, slug: 'trucking-company-setup',        name: 'Trucking company full setup',      price: 'from $799',      description: '',       featured: true,  image: 'https://i.pinimg.com/736x/b3/52/89/b35289829c9059beeca4a6dedefbc052.jpg' },
  { pillar: 2, slug: 'dot-number-application',        name: 'DOT number application',           price: '$149 flat',      description: '',       status: 'new'   },
  { pillar: 2, slug: 'mc-number',                     name: 'MC number (motor carrier)',        price: '$199 flat',      description: '',       status: 'new'   },
  { pillar: 2, slug: 'ein-registration',              name: 'EIN registration',                 price: '$99 flat',       description: '',        status: 'new'   },
  { pillar: 2, slug: 'business-credit-setup',         name: 'Business credit profile setup',   price: '$249 flat',      description: '',       status: 'new'   },
  { pillar: 2, slug: 'business-plan-pitch-deck',      name: 'Business plan & pitch deck',       price: 'from $399',      description: '',       status: 'new'   },

  // ── Pillar 3 ─────────────────────────────────────────────────────
  { pillar: 3, slug: 'mc-scraper',                    name: 'MC scraper (trucking leads)',      price: '$149/mo',        description: '',         featured: true,  image: 'https://i.pinimg.com/736x/e7/e8/c1/e7e8c157efbf383d01a233c18fab7d23.jpg' },
  { pillar: 3, slug: 'pos-software',                  name: 'POS software',                     price: '$99/mo', description: ''                          },
  { pillar: 3, slug: 'custom-saas',                   name: 'Custom SaaS development',          price: 'from $2,999',    description: '',     featured: true,  image: 'https://i.pinimg.com/736x/23/43/a3/2343a337194bf2c7802c2fb1f9d6fea2.jpg' },
  { pillar: 3, slug: 'dispatch-saas',                 name: 'Dispatch management SaaS',         price: '$299/mo',        description: '',         status: 'soon'  },
  { pillar: 3, slug: 'load-board-saas',               name: 'Load board / carrier marketplace', price: 'get quote',      description: '',       status: 'new'   },
  { pillar: 3, slug: 'white-label-saas',              name: 'White-label SaaS resell program',  price: 'revenue share',  description: '',   status: 'new'   },

  // ── Pillar 4 ─────────────────────────────────────────────────────
  { pillar: 4, slug: 'ai-chatbot',                    name: 'AI chatbot (website)',              price: '$599 + $299/mo', description: '',  featured: true,  image: 'https://i.pinimg.com/736x/6a/16/aa/6a16aa166fc9309a4a95b922e4e505ec.jpg' },
  { pillar: 4, slug: 'whatsapp-automation',           name: 'WhatsApp automation',               price: '$499 + $149/mo', description: ''                  },
  { pillar: 4, slug: 'facebook-instagram-bot',        name: 'Facebook / Instagram DM bot',      price: 'bundled', description: ''                         },
  { pillar: 4, slug: 'email-automation',              name: 'Email automation sequences',       price: 'bundled', description: ''                         },
  { pillar: 4, slug: 'social-media-ai',               name: 'Social media AI content',          price: '$399/mo', description: ''                         },
  { pillar: 4, slug: 'custom-ai-agent',               name: 'Custom AI assistant / agent',      price: 'get quote', description: ''                       },
  { pillar: 4, slug: 'ai-voice-agent',                name: 'AI voice agent',                   price: '$399 + $199/mo', description: '',  featured: true, status: 'new', image: 'https://i.pinimg.com/736x/0c/67/ad/0c67ad7910ee8e8ea1fd2a8a45e13f69.jpg' },
  { pillar: 4, slug: 'ai-receptionist',               name: 'AI receptionist',                  price: 'bundled w/ voice', description: '',  status: 'new' },
  { pillar: 4, slug: 'gohighlevel-setup',             name: 'GoHighLevel CRM setup',            price: 'get quote',      description: '',       status: 'new'   },
  { pillar: 4, slug: 'whatsapp-group-management',     name: 'WhatsApp group mgmt (trucking)',   price: '$99/mo',         description: '',          status: 'new'   },
  { pillar: 4, slug: 'workflow-automation',           name: 'Workflow automation (Zapier/Make)', price: 'get quote', description: ''                      },
  { pillar: 4, slug: 'ai-lead-gen-bot',               name: 'AI lead gen bot (outbound)',        price: 'from $599',      description: '',       status: 'new'  },

  // ── Pillar 5 Alpha Freight ───────────────────────────────────────
  { pillar: 5, slug: 'freight-dispatching',           name: 'Truck dispatching (carrier desk)',   price: '8% / 6% gross',  description: '',       featured: true,  image: 'https://i.pinimg.com/736x/c5/61/37/c56137a6d3def2f28cbb3f218ceb33ce.jpg' },
  { pillar: 5, slug: 'freight-driver-sourcing',       name: 'Driver hunting & recruiting support', price: 'Custom program', description: '',       image: 'https://images.unsplash.com/photo-1566576721346-8ee3bd76d0a3?w=800&q=80' },
  { pillar: 5, slug: 'freight-mc-lease-on',           name: 'MC lease-on programs',             price: 'Custom program', description: '',       image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80' },
  { pillar: 5, slug: 'freight-carrier-sales',         name: 'Carrier sales & lane positioning', price: 'Custom retainer', description: '',      image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80' },
  { pillar: 5, slug: 'freight-dat-management',        name: 'DAT load board management',        price: 'Custom retainer', description: '',      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80' },
  { pillar: 5, slug: 'freight-fmcsa-compliance',      name: 'FMCSA compliance support',         price: 'Custom program', description: '',       featured: true,  image: 'https://i.pinimg.com/736x/3d/ce/d3/3dced3edf5465a8fa9cf521b32f34c2a.jpg' },
  { pillar: 5, slug: 'freight-dispatch-training',     name: 'Dispatch training (online course)',  price: '$120',            description: '',       featured: true,  primaryHref: '/freight/dispatch-training', image: 'https://i.pinimg.com/736x/90/ed/98/90ed982115e40fe5de7b0677d31110ab.jpg' },
]
