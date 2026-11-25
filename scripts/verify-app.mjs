import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRANDS, getTotalModelCount } from '../src/data/brands.js';
import { REPAIR_PROBLEMS, DEMO_LOCATIONS, PICKUP_TIME_SLOTS, PUNE_CENTER } from '../src/data/problems.js';
import { INITIAL_SHOPS } from '../src/data/shops.js';
import { USER_ROLES } from '../src/data/demoUsers.js';
import { INITIAL_BOOKINGS, INITIAL_INCOMING_REQUESTS } from '../src/data/sampleBookings.js';
import {
  generateSimulatedQuotations,
  rankQuotations,
  estimateProblemBaseCost,
} from '../src/utils/quotationEngine.js';
import {
  BOOKING_STATUSES,
  calculateDistanceKm,
  buildSimulatedRoute,
  formatINR,
  formatPriceRange,
  formatHours,
  getStatusIndex,
  getPickupMethodLabel,
} from '../src/utils/helpers.js';
import {
  isValidEmail,
  validatePasswordStrength,
  generateSalt,
  hashPassword,
} from '../src/utils/auth.js';
import healthHandler from '../api/health.js';
import catalogHandler from '../api/catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

console.log('\n=== FixCycle Industry-Readiness & Full Verification Suite ===\n');

// 1. Security, API Key & Credential Leak Audit
await test('No hardcoded API keys, tokens, secrets, or leaked login credentials in src/ or index.html', () => {
  const files = [...walkFiles(srcDir), path.join(projectRoot, 'index.html')];
  const secretRegex = /(AIza[0-9A-Za-z\-_]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|pk_live_|sk_live_|fixcycle\.example|DemoRoleBanner)/i;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    assert(!secretRegex.test(content), `Potential secret or leaked login info found in ${file}`);
  }
});

await test('Salted SHA-256 auth hashing, email validation, and password policy work properly', async () => {
  assert(isValidEmail('user@example.com'), 'Valid email rejected');
  assert(!isValidEmail('not-an-email'), 'Invalid email accepted');
  assert(validatePasswordStrength('short1') !== '', 'Weak short password accepted');
  assert(validatePasswordStrength('abcdefgh') !== '', 'Password without digit accepted');
  assert(validatePasswordStrength('StrongPass123') === '', 'Strong password rejected');

  const salt = generateSalt();
  const h1 = await hashPassword('StrongPass123', salt);
  const h2 = await hashPassword('StrongPass123', salt);
  const h3 = await hashPassword('WrongPass123', salt);
  assert(h1 === h2 && h1 !== h3 && h1.length >= 16, 'Password hash mismatch');
});

await test('.gitignore protects .env and secret key files', () => {
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf8');
  assert(gitignore.includes('.env') && gitignore.includes('.env.local'), '.gitignore missing env entries');
});

// 2. Market Smartphone Catalog Tests
await test('20 major market smartphone brands and 220+ models exist', () => {
  const modelTotal = getTotalModelCount();
  assert(BRANDS.length >= 20, `Expected >= 20 brands, got ${BRANDS.length}`);
  assert(modelTotal >= 220, `Expected >= 220 models, got ${modelTotal}`);
  BRANDS.forEach((b) => {
    assert(b.id && b.name && Array.isArray(b.models) && b.models.length >= 5, `Invalid brand ${b.name}`);
  });
});

// 3. Pune, Maharashtra Map & Shop Data Tests
await test('All locations, shops, and map defaults are accurately centered in Pune, Maharashtra', () => {
  assert(PUNE_CENTER[0] > 18.4 && PUNE_CENTER[0] < 18.7, 'Invalid Pune center lat');
  assert(PUNE_CENTER[1] > 73.6 && PUNE_CENTER[1] < 74.1, 'Invalid Pune center lng');
  assert(DEMO_LOCATIONS.length >= 8, `Expected >= 8 Pune areas, got ${DEMO_LOCATIONS.length}`);
  assert(INITIAL_SHOPS.length >= 8, `Expected >= 8 Pune shops, got ${INITIAL_SHOPS.length}`);

  DEMO_LOCATIONS.forEach((loc) => {
    assert(loc.coords[0] >= 18.4 && loc.coords[0] <= 18.7, `Location ${loc.id} lat outside Pune`);
    assert(loc.coords[1] >= 73.6 && loc.coords[1] <= 74.1, `Location ${loc.id} lng outside Pune`);
  });

  INITIAL_SHOPS.forEach((shop) => {
    assert(shop.coords[0] >= 18.4 && shop.coords[0] <= 18.7, `Shop ${shop.name} lat outside Pune`);
    assert(shop.coords[1] >= 73.6 && shop.coords[1] <= 74.1, `Shop ${shop.name} lng outside Pune`);
    if (shop.category === 'independent') {
      assert(!shop.isAuthorized && shop.authorizedBrands.length === 0, `Independent shop marked authorized: ${shop.name}`);
    }
  });

  const srcFiles = walkFiles(srcDir);
  for (const file of srcFiles) {
    const text = fs.readFileSync(file, 'utf8');
    assert(!/Bengaluru|Indiranagar|Koramangala/i.test(text), `Leftover Bengaluru text in ${file}`);
  }
});

// 4. Quotation Engine & Helper Logic Tests
await test('Quotation engine produces >= 3 ranked Pune shop quotes for EVERY single one of the 20 brands', () => {
  for (const brand of BRANDS) {
    const req = {
      id: `REQ-${brand.id}`,
      brandId: brand.id,
      brandName: brand.name,
      model: brand.models[0],
      problemIds: ['broken_screen'],
      pickupCoords: DEMO_LOCATIONS[0].coords,
    };
    const quotes = generateSimulatedQuotations(req, INITIAL_SHOPS);
    assert(quotes.length >= 3, `Expected >= 3 quotes for ${brand.name}, got ${quotes.length}`);
    assert(quotes.filter((q) => q.recommended).length === 1, `Expected 1 recommended quote for ${brand.name}`);
  }
});

await test('Multi-problem bundles, declined quote re-ranking, and Pune route simulation work', () => {
  const est = estimateProblemBaseCost(['broken_screen', 'battery_drain'], 'samsung');
  assert(est.baseMax > est.baseMin && est.baseHours >= 2, 'Invalid multi-problem estimate');

  const req = {
    id: 'REQ-MULTI',
    brandId: 'apple',
    model: 'iPhone 16 Pro',
    problemIds: ['broken_screen', 'battery_drain'],
    pickupCoords: DEMO_LOCATIONS[1].coords,
  };
  const quotes = generateSimulatedQuotations(req, INITIAL_SHOPS);
  const recId = quotes.find((q) => q.recommended).id;
  const afterDecline = rankQuotations(
    quotes.map((q) => (q.id === recId ? { ...q, status: 'declined' } : q))
  );
  const newRec = afterDecline.find((q) => q.recommended);
  assert(newRec && newRec.id !== recId && newRec.status !== 'declined', 'Re-ranking failed');

  assert(BOOKING_STATUSES.length === 10 && getStatusIndex('phone_delivered') === 9, 'Timeline status error');
  const dist = calculateDistanceKm(DEMO_LOCATIONS[0].coords, INITIAL_SHOPS[0].coords);
  assert(dist > 0 && dist < 5, `Unexpected FC Road -> Deccan distance: ${dist}`);
  const pts = buildSimulatedRoute(INITIAL_SHOPS[0].coords, DEMO_LOCATIONS[0].coords, 36);
  assert(pts.length >= 30, 'Route interpolation error');
  assert(formatINR(2100).includes('2,100') && formatHours(3) === '3 hours', 'Format helpers error');
  assert(getPickupMethodLabel('delivery_partner').includes('Delivery'), 'Pickup label error');
  assert(USER_ROLES.customer && USER_ROLES.shop_owner && USER_ROLES.delivery_partner, 'Roles missing');
  assert(REPAIR_PROBLEMS.length === 12 && PICKUP_TIME_SLOTS.length >= 5, 'Problems/slots error');
  assert(INITIAL_BOOKINGS.length >= 2 && INITIAL_INCOMING_REQUESTS.length >= 2, 'Seed data error');
});

// 5. Vercel Serverless API & Production Config Tests
await test('Vercel serverless API handlers (/api/health, /api/catalog) and vercel.json are valid', () => {
  const vercelCfg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'vercel.json'), 'utf8'));
  assert(vercelCfg.outputDirectory === 'dist', 'Invalid outputDirectory in vercel.json');
  assert(Array.isArray(vercelCfg.headers) && vercelCfg.headers.length > 0, 'Missing security headers');
  assert(Array.isArray(vercelCfg.rewrites) && vercelCfg.rewrites.some((r) => r.destination === '/index.html'), 'Missing SPA rewrite');

  const createMockRes = () => {
    const out = { statusCode: 200, headers: {}, body: null };
    return {
      out,
      setHeader(k, v) { out.headers[k] = v; },
      status(code) { out.statusCode = code; return this; },
      json(data) { out.body = data; return this; },
    };
  };

  const healthRes = createMockRes();
  healthHandler({ method: 'GET' }, healthRes);
  assert(healthRes.out.statusCode === 200 && healthRes.out.body.status === 'ok', 'Health API failed');

  const catalogRes = createMockRes();
  catalogHandler({ method: 'GET' }, catalogRes);
  assert(
    catalogRes.out.statusCode === 200 &&
      catalogRes.out.body.city === 'Pune, Maharashtra' &&
      catalogRes.out.body.brandCount >= 20,
    'Catalog API failed'
  );
});

await test('All internal React Router links match declared routes in App.jsx', () => {
  const validStaticRoutes = new Set([
    '/',
    '/#how-it-works',
    '/select-phone',
    '/describe-problem',
    '/shops',
    '/quotations',
    '/track',
    '/my-bookings',
    '/shop-dashboard',
    '/delivery-dashboard',
    '/technician-dashboard',
    '/login',
    '/about',
  ]);
  const jsxFiles = walkFiles(srcDir).filter((f) => f.endsWith('.jsx'));
  for (const file of jsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const linkMatches = [...content.matchAll(/to="(\/[^"]*)"/g)];
    for (const m of linkMatches) {
      assert(validStaticRoutes.has(m[1]), `Unknown static route "${m[1]}" in ${path.basename(file)}`);
    }
  }
});

console.log(`\nSummary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
