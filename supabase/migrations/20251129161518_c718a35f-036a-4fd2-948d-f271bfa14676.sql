-- Create partner_listings table
CREATE TABLE public.partner_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  level TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partner_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view, post, and remove listings)
CREATE POLICY "Anyone can view partner listings"
  ON public.partner_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create partner listings"
  ON public.partner_listings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete partner listings"
  ON public.partner_listings
  FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_listings;