// Tests de l'API IA de l'app Tchopé (`pnpm test:pro`, Node 22+ : TypeScript lu sans outil).
// Politique /api/claude, contrôle Tchopé Pro (faux RevenueCat v2), limites, hôtes internes refusés, réservé à l'app.
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = await mkdtemp(path.join(tmpdir(), 'tchope-pro-'));
const copy = async (from, to, fix = (s) => s) => writeFile(path.join(dir, to), fix(await readFile(path.join(root, from), 'utf8')));
await copy('lib/server/rate-limit.ts', 'rate-limit.ts');
await copy('lib/server/pro-check.ts', 'pro-check.ts', (s) => s.replace("from './rate-limit'", "from './rate-limit.ts'"));
await copy('lib/server/claude-policy.ts', 'claude-policy.ts');
await copy('lib/server/app-only.ts', 'app-only.ts');
const A = await import(pathToFileURL(path.join(dir, 'app-only.ts')).href);
const P = await import(pathToFileURL(path.join(dir, 'pro-check.ts')).href);
const C = await import(pathToFileURL(path.join(dir, 'claude-policy.ts')).href);
// isPrivateHost vit dans la route : extrait tel quel.
const route = await readFile(path.join(root, 'app/api/fetch-recipe-url/route.ts'), 'utf8');
const fn = route.slice(route.indexOf('function isPrivateHost'), route.indexOf('const isHttp'));
await writeFile(path.join(dir, 'host.ts'), 'export ' + fn);
const H = await import(pathToFileURL(path.join(dir, 'host.ts')).href);

const PRO = '$RCAnonymousID:' + 'a'.repeat(32);
const FREE = '$RCAnonymousID:' + 'b'.repeat(32);
const FAKE = '$RCAnonymousID:' + 'f'.repeat(32);
const ENT = 'entl0000pro';
globalThis.fetch = async (url) => {
  const u = String(url);
  if (u.includes('/entitlements')) return new Response(JSON.stringify({ items: [{ id: ENT, lookup_key: 'tchope_pro' }] }), { status: 200 });
  const id = decodeURIComponent(u.split('/customers/')[1]);
  if (id !== PRO && id !== FREE) return new Response('{}', { status: 404 });
  return new Response(JSON.stringify({ active_entitlements: { items: id === PRO ? [{ entitlement_id: ENT, expires_at: Date.now() + 86_400_000 }] : [] } }), { status: 200 });
};
console.error = () => {};
const h = (o = {}) => ({ get: (n) => ({ 'x-forwarded-for': o.ip ?? '41.202.1.1', 'x-tchope-user': o.id ?? null, 'x-tchope-pro': o.pro ? '1' : null })[n.toLowerCase()] ?? null });

let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log(`✓ ${name}`);
};

await test('relais verrouillé : modèle non autorisé, max_tokens plafonné, trop d’images', async () => {
  assert.deepEqual(C.cleanClaudeRequest({ model: 'claude-opus-4-1', messages: [{ role: 'user', content: 'x' }] }), { error: 'model-not-allowed' });
  const ok = C.cleanClaudeRequest({ model: 'claude-haiku-4-5-20251001', max_tokens: 100000, system: [{ type: 'text', text: 's', cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: 'x' }] });
  assert.equal(ok.max_tokens, 2048);
  const img = { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'AAA' } };
  assert.equal(C.cleanClaudeRequest({ model: 'claude-haiku-4-5', messages: [{ role: 'user', content: [img] }] }).images, 1);
  assert.deepEqual(C.cleanClaudeRequest({ model: 'claude-haiku-4-5', messages: [{ role: 'user', content: [img, img, img] }] }), { error: 'too-large' });
  assert.deepEqual(C.cleanClaudeRequest({ model: 'claude-haiku-4-5', messages: [{ role: 'system', content: 'x' }] }), { error: 'bad-request' });
});

await test('sans clé : fermé (503) ; app sans identifiant : 403 update-app', async () => {
  let a = await P.resolveAccess(h({ id: PRO }));
  assert.deepEqual(P.accessRefusal(a), { status: 503, error: 'not-configured' });
  process.env.REVENUECAT_SECRET_KEY = 'sk';
  process.env.REVENUECAT_PROJECT_ID = 'proj';
  a = await P.resolveAccess(h());
  assert.deepEqual(P.accessRefusal(a), { status: 403, error: 'update-app' });
  assert.equal(P.checkLimits(a, 'chat').ok, false);
});

await test('réservé à l’app : un navigateur est refusé, le fetch natif passe', async () => {
  assert.equal(A.isBrowserRequest(new Headers({ origin: 'https://tchope.lndev.me' })), true);
  assert.equal(A.isBrowserRequest(new Headers({ 'sec-fetch-mode': 'cors' })), true);
  assert.equal(A.isBrowserRequest(new Headers({ 'x-tchope-user': PRO, 'user-agent': 'okhttp/4.12.0' })), false);
});

await test('abonné : toutes les fonctions ; non abonné : seulement le chat texte et le lien de recette', async () => {
  const pro = await P.resolveAccess(h({ id: PRO }));
  const free = await P.resolveAccess(h({ id: FREE }));
  assert.equal(pro.pro, true);
  for (const f of P.FEATURES) assert.equal(P.needsPro(pro, f), false, f);
  for (const f of ['chat-photo', 'ingredients', 'search', 'plan', 'plan-adjust', 'live-cooking']) assert.equal(P.needsPro(free, f), true, f);
  assert.equal(P.needsPro(free, 'chat'), false);
  assert.equal(P.needsPro(free, 'recipe-url'), false);
});

await test('identifiant inventé : 403 unknown-device', async () => {
  const a = await P.resolveAccess(h({ id: FAKE }));
  assert.deepEqual(P.accessRefusal(a), { status: 403, error: 'unknown-device' });
});

await test('avant-goût du chat : 4 par minute et 5 par jour par appareil, même en changeant d’IP', async () => {
  const a = await P.resolveAccess(h({ id: FREE }));
  const seen = [];
  for (let i = 0; i < 5; i++) seen.push(P.checkLimits({ ...a, ip: `41.0.0.${i}` }, 'chat').ok);
  assert.deepEqual(seen, [true, true, true, true, false]);
});

await test('hôtes internes refusés pour la lecture de lien', async () => {
  for (const x of ['localhost', '127.0.0.1', '10.1.2.3', '192.168.1.1', '172.20.0.1', '169.254.169.254', '::1', 'intranet', 'printer.local']) assert.equal(H.isPrivateHost(x), true, x);
  for (const x of ['www.marmiton.org', 'cuisine.cm', '8.8.8.8']) assert.equal(H.isPrivateHost(x), false, x);
});

await test('diagnostic : actif avec une clé et un projet valides', async () => {
  const st = await P.proCheckStatus();
  assert.equal(st.active, true);
});

await test('panne RevenueCat : un faux indice Pro ne donne jamais accès', async () => {
  P._resetProCache();
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 503 });
  const access = await P.resolveAccess(h({ id: PRO, pro: true }));
  assert.equal(access.pro, false);
  assert.deepEqual(P.accessRefusal(access), { status: 503, error: 'subscription-unavailable' });
  globalThis.fetch = original;
  assert.equal((await P.resolveAccess(h({ id: PRO, pro: true }))).pro, true);
});
await test('entitlement expiré ou date invalide ne débloque pas Pro', async () => {
  assert.equal(P.activeEntitlement([{ entitlement_id: ENT, expires_at: Date.now() - 1 }], ENT), false);
  assert.equal(P.activeEntitlement([{ entitlement_id: ENT, expires_at: 'invalid' }], ENT), false);
});

// Exercise the real route with a fake upstream; no credentials or paid requests.
await copy('app/api/claude/route.ts', 'claude-route.ts', s => s
  .replace('"next/server"', '"./next-stub.ts"')
  .replaceAll('"@/lib/server/claude-policy"', '"./claude-policy.ts"')
  .replaceAll('"@/lib/server/pro-check"', '"./pro-check.ts"')
  .replaceAll('"@/lib/server/app-only"', '"./app-only.ts"'));
await writeFile(path.join(dir, 'next-stub.ts'), 'export class NextRequest extends Request {}\nexport const NextResponse = { json: (data, options) => Response.json(data, options) };');
const routeApi = await import(pathToFileURL(path.join(dir, 'claude-route.ts')).href);
process.env.ANTHROPIC_API_KEY = 'test-only';
const revenuecat = globalThis.fetch;
let forwarded;
let aiStatus = 200;
let aiContent = [{ type: 'text', text: 'Remuez doucement.' }];
globalThis.fetch = async (url, options) => {
  if (!String(url).includes('api.anthropic.com')) return revenuecat(url, options);
  forwarded = JSON.parse(options.body);
  return Response.json({ content: aiContent }, { status: aiStatus });
};
const body = { model: 'claude-haiku-4-5', feature: 'live-cooking', system: 'Cooking assistant', messages: [{ role: 'user', content: 'Question' }], max_tokens: 2048 };
const post = (body, headers = {}) => routeApi.POST(new Request('https://test.invalid/api/claude', { method: 'POST', headers: { 'content-type': 'application/json', 'x-tchope-user': PRO, ...headers }, body: JSON.stringify(body) }));
await test('Live route: Pro required, browser refused, oversized histories rejected', async () => {
  P._resetProCache();
  assert.equal((await post(body, { 'x-tchope-user': FREE })).status, 402);
  assert.equal((await post(body, { origin: 'https://test.invalid' })).status, 403);
  assert.equal((await post({ ...body, messages: Array(9).fill(body.messages[0]) })).status, 413);
  assert.equal((await post({ ...body, system: 'x'.repeat(18001) })).status, 413);
});
await test('Live route: token cap, one current photo, no upstream error content leaked', async () => {
  const image = { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'AAA' } };
  assert.equal((await post({ ...body, messages: [{ role: 'user', content: [image, image] }] })).status, 413);
  const res = await post({ ...body, messages: [{ role: 'user', content: [{ type: 'text', text: 'Photo' }, image] }] });
  assert.equal(res.status, 200); assert.equal(forwarded.max_tokens, 256); assert.equal(forwarded.messages[0].content.length, 2);
  aiStatus = 429; assert.deepEqual(await (await post(body)).json(), { error: 'ai-failed' });
  aiStatus = 200; aiContent = []; assert.deepEqual(await (await post(body)).json(), { error: 'empty-response' });
});

await rm(dir, { recursive: true, force: true });
console.log(`\n${passed} tests OK`);
