import { supabase } from '@/lib/supabase';

export interface PropertySale {
	id: string;
	property_id: string;
	buyer_id: string;
	seller_id: string;
	sale_price: number;
	sale_date: string; // ISO date
	commission_rate: number;
	commission_amount: number;
	status: string; // pending | completed | cancelled
	notes?: string | null;
	created_at: string;
	updated_at: string;
	buyer_name?: string; // Ajouté pour compatibilité d'affichage
}

// Fonction utilitaire pour extraire le nom de l'acheteur depuis les notes
function extractBuyerName(notes: string | null): { buyerName: string | null, cleanNotes: string | null } {
	if (!notes) return { buyerName: null, cleanNotes: null };
	
	const buyerMatch = notes.match(/^Acheteur:\s*([^\n]+)/);
	if (buyerMatch) {
		const buyerName = buyerMatch[1].trim();
		const cleanNotes = notes.replace(/^Acheteur:\s*[^\n]+\n?/, '').trim() || null;
		return { buyerName, cleanNotes };
	}
	
	return { buyerName: null, cleanNotes: notes };
}

export async function getPropertySales(propertyId: string): Promise<{ sales: PropertySale[]; error: string | null }> {
	try {
		console.log('🔍 Fetching sales for property:', propertyId);
		
		const { data, error } = await supabase
			.from('property_sales')
			.select('*')
			.eq('property_id', propertyId)
			.order('sale_date', { ascending: false });

		console.log('📊 Raw Supabase result:', { data, error, count: data?.length });

		if (error) {
			console.error('❌ Supabase error:', error);
			return { sales: [], error: error.message };
		}
		
		// Traiter les données pour extraire le nom de l'acheteur
		const processedSales = (data || []).map(sale => {
			const { buyerName, cleanNotes } = extractBuyerName(sale.notes);
			console.log('🔄 Processing sale:', { 
				id: sale.id, 
				originalNotes: sale.notes, 
				buyerName, 
				cleanNotes 
			});
			return {
				...sale,
				buyer_name: buyerName,
				notes: cleanNotes
			} as PropertySale;
		});
		
		console.log('✅ Final processed sales:', processedSales);
		
		return { sales: processedSales, error: null };
	} catch (err: any) {
		console.error('Error fetching property sales:', err);
		return { sales: [], error: err.message };
	}
}

export async function createPropertySale(params: {
	property_id: string;
	sale_price: number;
	sale_date: string; // yyyy-mm-dd
	commission_rate: number;
	status?: string; // default completed
	notes?: string;
	buyer_name?: string;
}): Promise<{ sale: PropertySale | null; error: string | null }> {
	try {
		// Créer des UUIDs temporaires pour buyer_id et seller_id
		const generateUUID = () => crypto.randomUUID();
		
		// Créer les notes avec le nom de l'acheteur intégré
		let notesWithBuyer = params.notes || '';
		if (params.buyer_name) {
			notesWithBuyer = `Acheteur: ${params.buyer_name}${params.notes ? '\n' + params.notes : ''}`;
		}

		const payload = {
			property_id: params.property_id,
			buyer_id: generateUUID(), // UUID temporaire pour l'acheteur
			seller_id: generateUUID(), // UUID temporaire pour le vendeur
			sale_price: params.sale_price,
			commission_rate: params.commission_rate,
			sale_date: params.sale_date,
			status: params.status || 'completed',
			notes: notesWithBuyer || null,
		};

		console.log('💾 Creating sale with payload:', payload);

		const { data, error } = await supabase
			.from('property_sales')
			.insert([payload])
			.select('*')
			.single();

		if (error) {
			console.error('❌ Supabase error creating sale:', error);
			return { sale: null, error: error.message };
		}

		console.log('✅ Sale created successfully:', data);

		// Ajouter le nom de l'acheteur pour l'affichage
		const result = { 
			...data, 
			buyer_name: params.buyer_name 
		} as PropertySale;

		return { sale: result, error: null };
	} catch (err: any) {
		console.error('Error creating property sale:', err);
		return { sale: null, error: err.message };
	}
}


