#!/usr/bin/env node
/**
 * UI/UX Pro Max Search (Node.js engine)
 * BM25 & Semantic-token search engine for UI/UX style guides & design systems.
 * Works out-of-the-box with Node.js on any OS without Python requirement.
 * 
 * Usage:
 *   node search.mjs "<query>" [--domain <domain>] [--stack <stack>] [--max-results 3]
 *   node search.mjs "<query>" --design-system [-p "Project Name"]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = resolve(__dirname, '../data');

// Configuration matching core.py
const CSV_CONFIG = {
  style: {
    file: "styles.csv",
    search_cols: ["Style ID", "Style Category", "Aliases", "Keywords", "Best For", "Type", "AI Prompt Keywords"],
    output_cols: ["Style ID", "Style Category", "Aliases", "Status", "Preferred Mode", "Type", "Keywords", "Primary Colors", "Effects & Animation", "Best For", "Light Mode ✓", "Dark Mode ✓", "Performance", "Accessibility", "Complexity", "Implementation Checklist", "Design System Variables"]
  },
  color: {
    file: "colors.csv",
    search_cols: ["Product Type", "Notes"],
    output_cols: ["Product Type", "Primary", "On Primary", "Secondary", "On Secondary", "Accent", "On Accent", "Background", "Foreground", "Card", "Card Foreground", "Muted", "Muted Foreground", "Border", "Destructive", "On Destructive", "Ring", "Notes"]
  },
  chart: {
    file: "charts.csv",
    search_cols: ["Data Type", "Keywords", "Best Chart Type", "When to Use", "When NOT to Use", "Accessibility Notes"],
    output_cols: ["Data Type", "Keywords", "Best Chart Type", "Secondary Options", "When to Use", "When NOT to Use", "Data Volume Threshold", "Color Guidance", "Accessibility Grade", "Accessibility Risk", "Accessibility Notes", "A11y Fallback", "Library Recommendation"]
  },
  landing: {
    file: "landing.csv",
    search_cols: ["Pattern ID", "Pattern Name", "Aliases", "Keywords", "Conversion Optimization", "Section Order"],
    output_cols: ["Pattern ID", "Pattern Name", "Aliases", "Keywords", "Section Order", "Primary CTA Placement", "Color Strategy", "Conversion Optimization"]
  },
  product: {
    file: "products.csv",
    search_cols: ["Product Type", "Keywords", "Primary Style Recommendation", "Key Considerations"],
    output_cols: ["Product Type", "Keywords", "Primary Style Recommendation", "Secondary Styles", "Landing Page Pattern", "Dashboard Style (if applicable)", "Color Palette Focus"]
  },
  ux: {
    file: "ux-guidelines.csv",
    search_cols: ["Category", "Issue", "Description", "Platform"],
    output_cols: ["Category", "Issue", "Platform", "Description", "Do", "Don't", "Code Example Good", "Code Example Bad", "Severity"]
  },
  typography: {
    file: "typography.csv",
    search_cols: ["Font Pairing Name", "Category", "Mood/Style Keywords", "Best For", "Heading Font", "Body Font"],
    output_cols: ["Font Pairing Name", "Category", "Heading Font", "Body Font", "Mood/Style Keywords", "Best For", "Google Fonts URL", "CSS Import", "Tailwind Config", "Notes"]
  },
  icons: {
    file: "icons.csv",
    search_cols: ["Category", "Icon Name", "Keywords", "Best For", "Library"],
    output_cols: ["Category", "Icon Name", "Keywords", "Library", "Import Code", "Usage", "Best For", "Style", "Semantic Role", "Allowed Contexts"]
  },
  gsap: {
    file: "motion.csv",
    search_cols: ["Category", "Intensity Tier", "Keywords", "Trigger"],
    output_cols: ["Category", "Intensity Tier", "Trigger", "Duration", "Easing", "GSAP Snippet", "Framework Notes", "Do", "Don't", "Performance Notes"]
  },
  react: {
    file: "react-performance.csv",
    search_cols: ["Category", "Issue", "Keywords", "Description"],
    output_cols: ["Category", "Issue", "Platform", "Description", "Do", "Don't", "Code Example Good", "Code Example Bad", "Severity"]
  },
  web: {
    file: "app-interface.csv",
    search_cols: ["Category", "Issue", "Keywords", "Description"],
    output_cols: ["Category", "Issue", "Platform", "Description", "Do", "Don't", "Code Example Good", "Code Example Bad", "Severity"]
  },
  "google-fonts": {
    file: "google-fonts.csv",
    search_cols: ["Family", "Category", "Stroke", "Classifications", "Keywords", "Subsets", "Designers"],
    output_cols: ["Family", "Category", "Stroke", "Classifications", "Styles", "Variable Axes", "Subsets", "Designers", "Popularity Rank", "Google Fonts URL"]
  }
};

const STACK_MAP = {
  react: "stacks/react.csv",
  nextjs: "stacks/nextjs.csv",
  vue: "stacks/vue.csv",
  svelte: "stacks/svelte.csv",
  astro: "stacks/astro.csv",
  swiftui: "stacks/swiftui.csv",
  "react-native": "stacks/react-native.csv",
  flutter: "stacks/flutter.csv",
  nuxtjs: "stacks/nuxtjs.csv",
  "nuxt-ui": "stacks/nuxt-ui.csv",
  "html-tailwind": "stacks/html-tailwind.csv",
  shadcn: "stacks/shadcn.csv",
  "jetpack-compose": "stacks/jetpack-compose.csv",
  threejs: "stacks/threejs.csv",
  angular: "stacks/angular.csv",
  laravel: "stacks/laravel.csv"
};

// Robust RFC-4180 CSV parser
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] || '';
    });
    return obj;
  });
}

function loadCSV(relPath) {
  const fullPath = join(DATA_DIR, relPath);
  if (!existsSync(fullPath)) return [];
  const content = readFileSync(fullPath, 'utf8');
  return parseCSV(content);
}

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().match(/[a-z0-9_-]+/g) || [];
}

// BM25 implementation
function searchBM25(rows, query, searchCols, maxResults = 3) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || rows.length === 0) return [];

  const k1 = 1.5;
  const b = 0.75;
  const N = rows.length;

  // Build document corpus
  const docs = rows.map(row => {
    const text = searchCols.map(col => row[col] || '').join(' ');
    const tokens = tokenize(text);
    const tf = new Map();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    return { row, tokens, tf, length: tokens.length };
  });

  const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / (N || 1);

  // Compute Document Frequencies
  const df = new Map();
  for (const q of queryTokens) {
    let count = 0;
    for (const d of docs) {
      if (d.tf.has(q)) count++;
    }
    df.set(q, count);
  }

  // Calculate scores
  const scored = docs.map(doc => {
    let score = 0;
    for (const q of queryTokens) {
      const docCount = df.get(q) || 0;
      const idf = Math.log((N - docCount + 0.5) / (docCount + 0.5) + 1);
      const tfVal = doc.tf.get(q) || 0;
      const numerator = tfVal * (k1 + 1);
      const denominator = tfVal + k1 * (1 - b + b * (doc.length / (avgdl || 1)));
      score += idf * (numerator / (denominator || 1));
      
      // Bonus for exact phrase or substring match
      const fullText = searchCols.map(col => doc.row[col] || '').join(' ').toLowerCase();
      if (fullText.includes(query.toLowerCase())) {
        score += 5.0;
      }
    }
    return { ...doc.row, _score: score };
  });

  return scored
    .filter(item => item._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, maxResults);
}

// Format single result
function formatResults(title, results, outputCols) {
  if (results.length === 0) {
    return `### ${title}\nNo matching guidelines found for the given criteria.\n`;
  }
  let md = `### ${title} (${results.length} results)\n\n`;
  results.forEach((r, idx) => {
    md += `#### ${idx + 1}. ${r[outputCols[0]] || r[outputCols[1]] || 'Result'}\n`;
    for (const col of outputCols) {
      const val = r[col];
      if (val && val.trim().length > 0) {
        md += `- **${col}:** ${val}\n`;
      }
    }
    md += `\n`;
  });
  return md;
}

// Generate Design System
function generateDesignSystem(query, projectName = 'SmartInvite') {
  const productRows = loadCSV('products.csv');
  const styleRows = loadCSV('styles.csv');
  const colorRows = loadCSV('colors.csv');
  const typoRows = loadCSV('typography.csv');
  const uxRows = loadCSV('ux-guidelines.csv');

  const matchedProduct = searchBM25(productRows, query, CSV_CONFIG.product.search_cols, 1)[0] || {
    "Product Type": "SaaS Platform / Event Management",
    "Primary Style Recommendation": "Modern Minimalist / Ivory Navy Gold",
    "Keywords": "event, invitations, saas, cards, guest",
    "Landing Page Pattern": "Hero Centric + Live Preview + Social Proof",
    "Color Palette Focus": "Ivory (#FDFBF7), Navy (#0F172A), Gold Accent (#D4AF37)"
  };

  const matchedStyle = searchBM25(styleRows, matchedProduct["Primary Style Recommendation"] || query, CSV_CONFIG.style.search_cols, 1)[0] || {
    "Style ID": "S01-Modern-SaaS",
    "Style Category": "Clean & Functional",
    "Keywords": "minimal, clean, accessible, elegant",
    "Performance": "cost:low (CSS-only)",
    "Accessibility": "high-contrast, WCAG AA compliant"
  };

  const matchedColor = searchBM25(colorRows, query, CSV_CONFIG.color.search_cols, 1)[0] || {
    "Primary": "#0F172A (Deep Navy)",
    "Secondary": "#F8FAFC (Ivory/Slate Light)",
    "Accent": "#D4AF37 (Warm Gold / CTA)",
    "Background": "#FDFBF7 (Ivory Background)",
    "Foreground": "#0F172A (Slate Foreground)",
    "Card": "#FFFFFF (Pure White Card)",
    "Border": "#E2E8F0 (Subtle Border)",
    "Muted": "#64748B (Slate Muted)",
    "Notes": "Ivory/Navy/Gold graduation & event invitation elegance"
  };

  const matchedTypo = searchBM25(typoRows, query, CSV_CONFIG.typography.search_cols, 1)[0] || {
    "Font Pairing Name": "Playfair Display / Inter",
    "Heading Font": "Playfair Display (Serif Elegance)",
    "Body Font": "Inter (Functional Legibility)",
    "Mood/Style Keywords": "Formal, celebratory, invitation, high-end",
    "Best For": "Digital Invitations, Event Credentials, Graduation & Wedding SaaS"
  };

  const topUX = searchBM25(uxRows, "touch accessibility responsive contrast", CSV_CONFIG.ux.search_cols, 4);

  return `
+----------------------------------------------------------------------------------------+
|  PROJECT: ${projectName.toUpperCase()} - RECOMMENDED DESIGN SYSTEM SPECIFICATION                     |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  PRODUCT DOMAIN: ${matchedProduct["Product Type"] || query}
|  LAYOUT & PATTERN: ${matchedProduct["Landing Page Pattern"] || 'Modular SaaS Grid'}
|                                                                                        |
|  PRIMARY STYLE: ${matchedStyle["Style ID"] || 'Refined Modern'}
|     Category: ${matchedStyle["Style Category"] || 'Clean SaaS'}
|     Performance: ${matchedStyle["Performance"] || 'Zero runtime overhead'}
|     Accessibility: ${matchedStyle["Accessibility"] || 'WCAG 2.1 AA Required'}
|                                                                                        |
|  COLOR PALETTE (Semantic Tokens):
|     --color-primary:        ${matchedColor["Primary"] || '#0F172A'}
|     --color-secondary:      ${matchedColor["Secondary"] || '#F8FAFC'}
|     --color-accent (CTA):   ${matchedColor["Accent"] || '#D4AF37'}
|     --color-background:     ${matchedColor["Background"] || '#FDFBF7'}
|     --color-card:           ${matchedColor["Card"] || '#FFFFFF'}
|     --color-foreground:     ${matchedColor["Foreground"] || '#0F172A'}
|     --color-muted:          ${matchedColor["Muted"] || '#64748B'}
|     --color-border:         ${matchedColor["Border"] || '#E2E8F0'}
|     Notes: ${matchedColor["Notes"] || 'Balanced contrast and elegant invitation tones'}
|                                                                                        |
|  TYPOGRAPHY SYSTEM:
|     Heading: ${matchedTypo["Heading Font"] || 'Playfair Display / Serif'}
|     Body:    ${matchedTypo["Body Font"] || 'Inter / Sans-Serif'}
|     Hierarchy: Base 16px, Line-height 1.5, Scale: 12px / 14px / 16px / 20px / 28px / 36px
|                                                                                        |
|  CRITICAL PRE-DELIVERY QUALITY CHECKLIST:
|     [x] Touch target minimum 44x44px for every interactive element
|     [x] Contrast ratio minimum 4.5:1 for body text (3:1 for large headings)
|     [x] Responsive test matrix: 360px, 390px, 768px, 1280px (zero horizontal scroll)
|     [x] Semantic state coverage: Loading, Empty, Error, and Success states
|     [x] Respects prefers-reduced-motion for all transitions and card animations
|     [x] No emojis as functional icons — use clean SVGs with accessible aria-label
|                                                                                        |
+----------------------------------------------------------------------------------------+
`;
}

// CLI Argument Parsing
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(`
UI/UX Pro Max Search (Node.js engine)
Usage:
  node search.mjs "<query>" [--domain <domain>] [--stack <stack>] [--max-results 3]
  node search.mjs "<query>" --design-system [-p "Project Name"]

Available Domains:
  style, color, chart, landing, product, ux, typography, google-fonts, icons, gsap, react, web

Available Stacks:
  react, nextjs, vue, svelte, astro, swiftui, react-native, flutter,
  nuxtjs, nuxt-ui, html-tailwind, shadcn, jetpack-compose, threejs, angular, laravel
`);
    process.exit(0);
  }

  let query = '';
  let domain = null;
  let stack = null;
  let maxResults = 3;
  let isDesignSystem = false;
  let projectName = 'SmartInvite';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--domain' && args[i + 1]) {
      domain = args[++i].toLowerCase();
    } else if (arg === '--stack' && args[i + 1]) {
      stack = args[++i].toLowerCase();
    } else if ((arg === '--max-results' || arg === '-m') && args[i + 1]) {
      maxResults = parseInt(args[++i], 10) || 3;
    } else if (arg === '--design-system') {
      isDesignSystem = true;
    } else if ((arg === '-p' || arg === '--project') && args[i + 1]) {
      projectName = args[++i];
    } else if (!arg.startsWith('-')) {
      query = query ? `${query} ${arg}` : arg;
    }
  }

  if (isDesignSystem) {
    console.log(generateDesignSystem(query, projectName));
    return;
  }

  if (stack) {
    const relFile = STACK_MAP[stack];
    if (!relFile) {
      console.error(`Error: Unknown stack "${stack}". Available: ${Object.keys(STACK_MAP).join(', ')}`);
      process.exit(1);
    }
    const rows = loadCSV(relFile);
    const searchCols = ["Category", "Guideline", "Description", "Do", "Don't", "Code Good", "Code Bad"];
    const outputCols = ["Category", "Guideline", "Description", "Do", "Don't", "Code Good", "Code Bad", "Severity", "Docs URL"];
    const results = searchBM25(rows, query, searchCols, maxResults);
    console.log(formatResults(`Stack Guidelines: ${stack.toUpperCase()} for "${query}"`, results, outputCols));
    return;
  }

  const targetDomain = domain || 'ux';
  const conf = CSV_CONFIG[targetDomain];
  if (!conf) {
    console.error(`Error: Unknown domain "${targetDomain}". Available: ${Object.keys(CSV_CONFIG).join(', ')}`);
    process.exit(1);
  }

  const rows = loadCSV(conf.file);
  const results = searchBM25(rows, query, conf.search_cols, maxResults);
  console.log(formatResults(`UI/UX Guidelines: [${targetDomain.toUpperCase()}] for "${query}"`, results, conf.output_cols));
}

main();
