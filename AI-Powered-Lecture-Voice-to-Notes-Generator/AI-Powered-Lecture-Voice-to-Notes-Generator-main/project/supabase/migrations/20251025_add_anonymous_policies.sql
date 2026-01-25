-- Add anonymous policies for demo users

-- Anonymous policies for lectures table
CREATE POLICY "Anonymous can view lectures"
  ON lectures FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous can insert lectures"
  ON lectures FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous can update lectures"
  ON lectures FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can delete lectures"
  ON lectures FOR DELETE
  TO anon
  USING (true);

-- Anonymous policies for notes table
CREATE POLICY "Anonymous can view notes"
  ON notes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous can insert notes"
  ON notes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous can update notes"
  ON notes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can delete notes"
  ON notes FOR DELETE
  TO anon
  USING (true);
