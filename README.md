# Transaction Manager

## TODOs

- Improve the desktop layout (so much wasted horizontal space.
- Make the popup into an actual popup
  - Also add a "New" button that shows the popup for creating a new transaction
- Make the app into a container for easy deployment
  - Not strictly necessary, but I wanna have a bit of Nix fun
- I kinda wanna add options for sorting the transactions -- but alas, no time

## Set up Supabase

1. Create a table with the schema described in
   [`schema.sql`](supabase/schema.sql) under the `supabase/` directory.

2. Copy over `.env.local.example` to `.env.local`.

3. Copy your Supabase URL and your anonymous key into the newly created
   `.env.local` file.

## How to Run

This project was made with Node.js 20, but you can probably run it with
older versions like Node.js 18.

```bash
npm install
npm run dev
# Or for production:
npm ci
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result.

This project uses
[`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to
automatically optimize and load Inter, a custom Google Font.
