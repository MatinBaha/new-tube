import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log('Adding mux columns to videos table...');
    await sql`ALTER TABLE videos ADD COLUMN mux_status text;`;
    await sql`ALTER TABLE videos ADD COLUMN mux_asset_id text;`;
    await sql`ALTER TABLE videos ADD COLUMN mux_upload_id text;`;
    await sql`ALTER TABLE videos ADD COLUMN mux_playback_id text;`;
    await sql`ALTER TABLE videos ADD COLUMN mux_track_id text;`;
    await sql`ALTER TABLE videos ADD COLUMN mux_track_status text;`;
    await sql`ALTER TABLE videos ADD CONSTRAINT videos_mux_asset_id_unique UNIQUE(mux_asset_id);`;
    await sql`ALTER TABLE videos ADD CONSTRAINT videos_mux_playback_id_unique UNIQUE(mux_playback_id);`;
    console.log('Successfully added columns!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
