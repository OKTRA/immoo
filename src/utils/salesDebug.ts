import { supabase } from '@/lib/supabase';

export async function debugSalesTable() {
  console.log('🔧 Debugging sales table...');

  try {
    // Test 1: Check if table exists and we can query it
    const { data: allSales, error: allError } = await supabase
      .from('property_sales')
      .select('*')
      .limit(5);

    console.log('📋 All sales (limit 5):', { data: allSales, error: allError });

    // Test 2: Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('property_sales')
      .select('*')
      .limit(1);

    if (tableInfo && tableInfo.length > 0) {
      console.log('🏗️ Table structure (first row):', Object.keys(tableInfo[0]));
    }

    // Test 3: Count total records
    const { count, error: countError } = await supabase
      .from('property_sales')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Total records in property_sales:', { count, error: countError });

    return { allSales, allError, count };
  } catch (error) {
    console.error('❌ Debug error:', error);
    return { error };
  }
}
