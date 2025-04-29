# Creating Tables in Supabase Dashboard

Since we're having difficulties with the automated approaches, you can create the tables directly using the Supabase SQL Editor:

1. Login to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `mfeaktevlnqvyapgaqvw`
3. Go to the SQL Editor (Table Editor > SQL)
4. Copy and paste the following SQL and execute it:

```sql
-- assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- parts table
CREATE TABLE IF NOT EXISTS parts (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  block_type TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  sequence_order INTEGER,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- mcq_options table
CREATE TABLE IF NOT EXISTS mcq_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
  scenario_text TEXT NOT NULL,
  sequence_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- scenario_options table
CREATE TABLE IF NOT EXISTS scenario_options (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- likert_statements table
CREATE TABLE IF NOT EXISTS likert_statements (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  statement_text TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- assessment_attempts table
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, 
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_part_id INTEGER REFERENCES parts(id)
);

-- Enable RLS
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;

-- user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  mcq_option_id INTEGER REFERENCES mcq_options(id),
  text_answer TEXT,
  likert_rating INTEGER,
  video_response_path TEXT,
  scenario_id INTEGER REFERENCES scenarios(id),
  scenario_option_id INTEGER REFERENCES scenario_options(id),
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
```

5. After executing, check that the tables were created by navigating to "Table Editor"

## Verifying Tables Were Created

Once you've run the SQL, you should be able to see all the tables in the Table Editor section of the Supabase dashboard. 