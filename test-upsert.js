import 'dotenv/config.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env.backend' });
import { supabase } from './server/utils/supabase.js';

async function test() {
   const { data, error } = await supabase.from('sample_bookings').upsert({
      phone: '9999',
      status: 'PENDING',
      txnid: 'VRXTEST123'
   }, { onConflict: 'txnid' });

   if (error) {
      console.error("UPSERT ERROR:", error.message, error.details);
   } else {
      console.log("UPSERT SUCCESS!");
   }
}
test();
