# Supabase Database Schema for Leerbot

## Required Tables

Based on your app's code, you need these tables in Supabase:

### 1. lists
```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add word count (computed or stored)
ALTER TABLE lists ADD COLUMN woord_count INT DEFAULT 0;
```

### 2. words
```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  source_word TEXT NOT NULL,
  target_word TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. shared_lists (for "Ontdek" feature)
```sql
CREATE TABLE shared_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL, -- 'en', 'fr', 'de', etc.
  level TEXT,            -- 'A1', 'A2', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. shared_words
```sql
CREATE TABLE shared_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_list_id UUID REFERENCES shared_lists(id) ON DELETE CASCADE,
  source_word TEXT NOT NULL,
  target_word TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. user_stats (for gamification)
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. user_badges
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP DEFAULT NOW()
);
```

### 7. profiles (optional - for admin roles)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### Enable RLS on all tables:
```sql
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Example Policies:

#### lists - Users can only see their own lists
```sql
CREATE POLICY "Users can view own lists" ON lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON lists
  FOR DELETE USING (auth.uid() = user_id);
```

#### words - Users can only access words from their lists
```sql
CREATE POLICY "Users can view words from own lists" ON words
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = words.list_id 
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert words to own lists" ON words
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = words.list_id 
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update words in own lists" ON words
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = words.list_id 
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete words from own lists" ON words
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = words.list_id 
      AND lists.user_id = auth.uid()
    )
  );
```

#### shared_lists - Everyone can read
```sql
CREATE POLICY "Anyone can view shared lists" ON shared_lists
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage shared lists" ON shared_lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
```

#### shared_words - Everyone can read
```sql
CREATE POLICY "Anyone can view shared words" ON shared_words
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage shared words" ON shared_words
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
```

#### user_stats - Users can only access their own stats
```sql
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### user_badges - Similar to user_stats
```sql
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Database Functions (Optional but Recommended)

### Auto-create user profile on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false);
  
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Update word count when words are added/removed
```sql
CREATE OR REPLACE FUNCTION update_list_word_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE lists 
    SET woord_count = woord_count - 1 
    WHERE id = OLD.list_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE lists 
    SET woord_count = woord_count + 1 
    WHERE id = NEW.list_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER word_count_trigger
  AFTER INSERT OR DELETE ON words
  FOR EACH ROW EXECUTE FUNCTION update_list_word_count();
```

## Setup Steps

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each table creation script
4. Enable RLS on all tables
5. Add the RLS policies
6. (Optional) Add the database functions
7. Test by creating a user and trying to add a list

## Making Your App Work Without API Endpoints

Replace your API calls with direct Supabase queries:

### Example: Getting lists
```javascript
// OLD (requires API endpoint):
const res = await fetch('/api?resource=lists', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const lists = await res.json()

// NEW (works with just Supabase):
const { data: lists, error } = await supabase
  .from('lists')
  .select('*, woord_count')
  .order('created_at', { ascending: false })
```

### Example: Creating a list
```javascript
// OLD:
const res = await fetch('/api?resource=lists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ name, description })
})

// NEW:
const { data: { session } } = await supabase.auth.getSession()
const { data, error } = await supabase
  .from('lists')
  .insert([
    { 
      user_id: session.user.id,
      name: name,
      description: description 
    }
  ])
  .select()
```

### Example: Getting words from a list
```javascript
// OLD:
const res = await fetch(`/api/words?listId=${listId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})

// NEW:
const { data: words, error } = await supabase
  .from('words')
  .select('*')
  .eq('list_id', listId)
  .order('created_at', { ascending: true })
```

## Next Steps

1. Create all tables in Supabase SQL Editor
2. Set up RLS policies
3. Update your JavaScript files to use direct Supabase queries
4. Remove the API endpoint calls
5. Deploy to Netlify
6. Test everything works!

Need help? Check the [Supabase documentation](https://supabase.com/docs).
