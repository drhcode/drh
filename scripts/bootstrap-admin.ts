/**
 * Creates the first super admin.
 *
 *   npm run bootstrap:admin -- you@drh.al "Your Name"
 *
 * Run this once, after applying the migrations. It uses the service role key,
 * so it must only ever be run from a trusted machine — never from CI logs or a
 * shared terminal.
 *
 * Password precedence:
 *   1. the third argument
 *   2. the ADMIN_PASSWORD environment variable (keeps it out of shell history)
 *   3. a generated one, printed once to your terminal
 *
 * If the account already exists it is promoted to super admin, and its password
 * is reset when one is supplied.
 */
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

/** Minimal .env.local reader so the script has no dotenv dependency. */
function loadEnv(): Record<string, string> {
  const file = resolve(root, '.env.local');
  if (!existsSync(file)) return {};

  const env: Record<string, string> = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main(): Promise<void> {
  const fileEnv = loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY;

  const [email, nameArg, passwordArg] = process.argv.slice(2);
  const fullName = (nameArg ?? '').trim();
  const suppliedPassword = passwordArg ?? process.env.ADMIN_PASSWORD ?? null;

  if (!url || !serviceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Set them in .env.local first.',
    );
    process.exit(1);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.error('Usage: npm run bootstrap:admin -- you@drh.al "Your Name" [password]');
    process.exit(1);
  }

  if (suppliedPassword && suppliedPassword.length < 6) {
    console.error('Supabase requires a password of at least 6 characters.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Reasonably strong temporary password when none was supplied.
  const password = suppliedPassword ?? `${randomBytes(12).toString('base64url')}Aa1!`;

  // A short password on the account that owns every lead and setting is worth
  // saying out loud, once, rather than silently accepting.
  if (suppliedPassword && suppliedPassword.length < 12) {
    console.warn(
      [
        '',
        `  ⚠  That password is ${suppliedPassword.length} characters. This account can read every`,
        '     lead and change every setting — a longer passphrase is worth the',
        '     few extra keystrokes. Change it from /admin/login → "Forgot?".',
        '',
      ].join('\n'),
    );
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || email.split('@')[0],
      role: 'super_admin',
      is_active: true,
    },
  });

  if (error) {
    // Already exists: promote the existing account instead of failing.
    if (error.message.toLowerCase().includes('already')) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users.find((user) => user.email === email);

      if (!existing) {
        console.error(`Could not create or find ${email}: ${error.message}`);
        process.exit(1);
      }

      const { error: promoteError } = await supabase
        .from('admin_users')
        .upsert(
          {
            id: existing.id,
            email,
            full_name: fullName || email.split('@')[0],
            role: 'super_admin',
            is_active: true,
          },
          { onConflict: 'id' },
        );

      if (promoteError) {
        console.error(`Could not promote ${email}: ${promoteError.message}`);
        process.exit(1);
      }

      if (suppliedPassword) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(existing.id, {
          password: suppliedPassword,
        });
        if (passwordError) {
          console.error(`Promoted, but the password could not be set: ${passwordError.message}`);
          process.exit(1);
        }
      }

      console.log(`\n✓ ${email} already existed and is now an active super admin.`);
      console.log(
        suppliedPassword
          ? '  Its password has been reset to the one you supplied.\n'
          : '  Use "Forgot?" on /admin/login if you need to reset the password.\n',
      );
      return;
    }

    console.error(`Could not create the user: ${error.message}`);
    process.exit(1);
  }

  // The auth trigger mirrors the user into admin_users; make certain the role
  // and active flag are what we intended.
  const { error: profileError } = await supabase
    .from('admin_users')
    .upsert(
      {
        id: data.user!.id,
        email,
        full_name: fullName || email.split('@')[0],
        role: 'super_admin',
        is_active: true,
      },
      { onConflict: 'id' },
    );

  if (profileError) {
    console.error(`User created, but the admin profile failed: ${profileError.message}`);
    console.error('Check that migration 0001_schema.sql has been applied.');
    process.exit(1);
  }

  console.log('\n✓ Super admin created.\n');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${suppliedPassword ? '(the one you supplied)' : password}`);
  console.log('\n  Sign in at /admin/login.\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
