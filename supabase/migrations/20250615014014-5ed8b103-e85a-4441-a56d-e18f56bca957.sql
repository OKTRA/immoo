
CREATE OR REPLACE VIEW public.agencies_with_property_count AS
SELECT
    a.*,
    (SELECT count(*) FROM public.properties p WHERE p.agency_id = a.id) as computed_properties_count
FROM
    public.agencies a;
