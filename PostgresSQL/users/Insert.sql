INSERT INTO public.users (username, password, logged, last_activity)
VALUES ($1, $2, false, NOW())
ON CONFLICT (username)
    DO UPDATE SET
                  password = EXCLUDED.password,
                  logged = EXCLUDED.logged,
                  last_activity = EXCLUDED.last_activity
RETURNING *;