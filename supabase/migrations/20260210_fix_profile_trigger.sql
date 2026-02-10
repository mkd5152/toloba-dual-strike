-- Fix the auto profile creation trigger to not fail on RLS errors
-- This trigger runs when admin API creates users, but RLS blocks it
-- We want it to silently succeed so the admin API can create the profile instead

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert profile, ignore if RLS blocks it (admin API will handle it)
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'spectator'),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Always return NEW to not block the user creation
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs (like RLS), silently ignore and let admin API handle it
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
