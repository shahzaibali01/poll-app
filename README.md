# 🗳️ Real-Time Polling App

A modern, full-stack real-time polling application built with **React**, **Supabase**, **Vite**, and **Tailwind CSS**. Users can create polls, vote (anonymously or via login), and view live-updating results.

### 🔗 Demo
[Live App on Netlify](https://bigosoft-poll-test.netlify.app)

---

## 📦 Tech Stack

- **Frontend:** React 19 + TypeScript, Vite
- **State Management:** React Hook Form, LocalStorage
- **Styling:** Tailwind CSS + Ant Design 5
- **Charts:** Recharts, Chart.js
- **Backend:** Supabase (Postgres, Auth, Realtime)
- **Notifications:** react-hot-toast
- **Deployment:** Netlify

---

## 🚀 Features

### 👤 Authentication
- Email/password login and sign-up via Supabase Auth
- Protected profile route
- Anonymous users can still vote (tracked with localStorage + IP hash)

### 📝 Poll Management
- Create polls with:
  - Question
  - 2–10 options
  - Allow multiple answers
  - End date (optional)
- Public poll listing (with search/filter)
- Delete your own polls

### 🗳️ Voting System
- Single or multiple choice voting
- Duplicate vote prevention (user ID or IP hash)
- Voting disabled after poll ends

### 📊 Results + Live Features
- Bar / Pie / List result visualizations
- Realtime vote updates via Supabase Channels
- Animated chart transitions
- Viewer count in real-time
- Export results as CSV

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/shahzaibali01/poll-app.git
cd poll-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

Create the following tables in Supabase SQL editor:

```sql
-- polls
CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options text[] NOT NULL,
  settings jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz
);

-- votes
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id),
  user_id uuid REFERENCES auth.users(id),
  ip_hash text NOT NULL,
  selected_options text[],
  created_at timestamptz DEFAULT now()
);

-- profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  created_polls_count int DEFAULT 0
);
```

Also create this RPC:

```sql
CREATE OR REPLACE FUNCTION get_user_polls_with_votes(user_id uuid)
RETURNS TABLE (
  id uuid,
  question text,
  created_at timestamp,
  ends_at timestamp,
  vote_count int
)
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.question, p.created_at, p.ends_at,
         (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) AS vote_count
  FROM polls p
  WHERE p.created_by = user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

Apply Row-Level Security (RLS) policies:
- Anyone can read polls
- Only authenticated users can create/delete their polls
- Users can only vote once per poll (based on IP or user ID)

---

### 4. Set Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### 5. Run Dev Server

```bash
npm run dev
```

---

### 6. Build for Production

```bash
npm run build
```

Add this file: `public/_redirects`

```
/*    /index.html   200
```

Then deploy `dist/` to Netlify.

---

## 🧠 Architecture Decisions

- Supabase handles Auth, Realtime, and Database
- Anonymous users tracked using UUID in localStorage
- Charts update live via Supabase's channel and presence
- Vite provides fast development & optimized production builds

---


## ✨ Future Enhancements

- QR code for sharing polls
- Embed code generator
- Poll templates (Yes/No, Ratings)
- Anonymous comments
- Dark mode toggle

---

## 🧑‍💻 Author

Shahzaib Ali#   p o l l - a p p  
 