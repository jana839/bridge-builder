import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of expired listings...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get current timestamp minus 24 hours (delete listings that expired over 24 hours ago)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    console.log(`Checking for listings that expired before: ${twentyFourHoursAgo.toISOString()}`);

    // Fetch all listings
    const { data: listings, error: fetchError } = await supabase
      .from('partner_listings')
      .select('*');

    if (fetchError) {
      console.error('Error fetching listings:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${listings?.length || 0} total listings`);

    // Filter expired listings (event time + 24 hours < now)
    const expiredListings = (listings || []).filter((listing) => {
      const listingDateTime = new Date(`${listing.date}T${listing.time}:00`);
      listingDateTime.setHours(listingDateTime.getHours() + 24); // Add 24 hours grace period
      return listingDateTime < new Date();
    });

    console.log(`Found ${expiredListings.length} expired listings to delete`);

    if (expiredListings.length > 0) {
      // Delete expired listings
      const expiredIds = expiredListings.map(listing => listing.id);
      
      const { error: deleteError } = await supabase
        .from('partner_listings')
        .delete()
        .in('id', expiredIds);

      if (deleteError) {
        console.error('Error deleting expired listings:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted ${expiredListings.length} expired listings`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount: expiredListings.length,
        message: `Cleaned up ${expiredListings.length} expired listing(s)`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in cleanup function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
