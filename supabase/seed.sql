-- ============================================================================
-- MugenDojo — Development Seed Data
-- Run via: pnpm run db:reset (applies migrations + seed)
-- ============================================================================
-- WARNING: Local development only. Never use in production.
-- Password for all test users: "password123"
-- ============================================================================

-- Fixed UUIDs for reproducible references
DO $$
DECLARE
  v_user_sensei_id  uuid := 'a1b2c3d4-0001-0001-0001-000000000001';
  v_user_senpai_id  uuid := 'a1b2c3d4-0002-0002-0002-000000000002';
  v_user_student_id uuid := 'a1b2c3d4-0003-0003-0003-000000000003';
  v_dojo_id         uuid := 'dddddddd-dddd-dddd-dddd-000000000001';
  v_profile_senpai  uuid;
BEGIN

  -- ────────────────────────────────────────────────────────────────────────────
  -- 1. AUTH USERS (inserted directly into auth.users for local dev)
  --    GoTrue requires all varchar columns to be '' not NULL
  -- ────────────────────────────────────────────────────────────────────────────

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    email_change_confirm_status,
    phone_change, phone_change_token,
    reauthentication_token,
    is_sso_user, is_anonymous
  ) VALUES
    -- Sensei (Head Master)
    (
      '00000000-0000-0000-0000-000000000000',
      v_user_sensei_id,
      'authenticated', 'authenticated',
      'sensei@mugendojo.it',
      crypt('password123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}',
      '', '',
      '', '', '',
      0,
      '', '',
      '',
      false, false
    ),
    -- Senpai (Secretary)
    (
      '00000000-0000-0000-0000-000000000000',
      v_user_senpai_id,
      'authenticated', 'authenticated',
      'senpai@mugendojo.it',
      crypt('password123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}',
      '', '',
      '', '', '',
      0,
      '', '',
      '',
      false, false
    ),
    -- Student (Aikidoka)
    (
      '00000000-0000-0000-0000-000000000000',
      v_user_student_id,
      'authenticated', 'authenticated',
      'studente@mugendojo.it',
      crypt('password123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}',
      '', '',
      '', '', '',
      0,
      '', '',
      '',
      false, false
    )
  ON CONFLICT (id) DO NOTHING;

  -- Supabase Auth requires identities for email login
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES
    (
      v_user_sensei_id, v_user_sensei_id,
      jsonb_build_object('sub', v_user_sensei_id, 'email', 'sensei@mugendojo.it'),
      'email', v_user_sensei_id::text, now(), now(), now()
    ),
    (
      v_user_senpai_id, v_user_senpai_id,
      jsonb_build_object('sub', v_user_senpai_id, 'email', 'senpai@mugendojo.it'),
      'email', v_user_senpai_id::text, now(), now(), now()
    ),
    (
      v_user_student_id, v_user_student_id,
      jsonb_build_object('sub', v_user_student_id, 'email', 'studente@mugendojo.it'),
      'email', v_user_student_id::text, now(), now(), now()
    )
  ON CONFLICT DO NOTHING;

  -- ────────────────────────────────────────────────────────────────────────────
  -- 2. DOJO
  -- ────────────────────────────────────────────────────────────────────────────

  INSERT INTO dojos (id, name, address, federation)
  VALUES (
    v_dojo_id,
    'Mugen Dojo',
    'Via dell''Aikido 42, Roma',
    'Aikikai d''Italia'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ────────────────────────────────────────────────────────────────────────────
  -- 3. PROFILES
  -- ────────────────────────────────────────────────────────────────────────────

  INSERT INTO profiles (id, user_id, dojo_id, first_name, last_name, role, current_grade, can_conduct, enrollment_date)
  VALUES
    (gen_random_uuid(), v_user_sensei_id, v_dojo_id, 'Marco', 'Rossi', 'head_master', 'dan_3', true, '2010-09-01'),
    (gen_random_uuid(), v_user_senpai_id, v_dojo_id, 'Laura', 'Bianchi', 'secretary', 'kyu_1', false, '2018-09-01'),
    (gen_random_uuid(), v_user_student_id, v_dojo_id, 'Giulia', 'Verdi', 'aikidoka', 'kyu_4', false, '2023-09-01')
  ON CONFLICT DO NOTHING;

  -- Get the senpai profile ID for secretary permissions
  SELECT id INTO v_profile_senpai FROM profiles WHERE user_id = v_user_senpai_id AND dojo_id = v_dojo_id;

  -- ────────────────────────────────────────────────────────────────────────────
  -- 4. SECRETARY PERMISSIONS (for Senpai)
  -- ────────────────────────────────────────────────────────────────────────────

  IF v_profile_senpai IS NOT NULL THEN
    INSERT INTO secretary_permissions (profile_id, dojo_id, can_view_all_attendance, can_confirm_attendance, can_send_communications)
    VALUES (v_profile_senpai, v_dojo_id, true, true, true)
    ON CONFLICT (profile_id, dojo_id) DO NOTHING;
  END IF;

END $$;
