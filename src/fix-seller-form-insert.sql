-- Fix how data is handled during seller verification form submission

-- Create a test select to verify the current seller verification form structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'seller_verifications'
ORDER BY ordinal_position;

-- Create an RPC function that handles verification data insertion properly
CREATE OR REPLACE FUNCTION submit_seller_verification(
  p_seller_id UUID,
  p_document_type TEXT,
  p_document_url TEXT,
  p_document_number TEXT,
  p_document_expiry_date DATE,
  p_government_id_type TEXT,
  p_government_id_url TEXT,
  p_seller_type TEXT,
  p_first_name TEXT,
  p_middle_name TEXT,
  p_last_name TEXT,
  p_suffix TEXT,
  p_business_name TEXT,
  p_registered_address TEXT,
  p_zip_code TEXT,
  p_tin_number TEXT,
  p_vat_status TEXT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Insert the complete verification data
  INSERT INTO seller_verifications(
    seller_id,
    document_type,
    document_url,
    document_number,
    document_expiry_date,
    government_id_type,
    government_id_url,
    seller_type,
    first_name,
    middle_name,
    last_name,
    suffix,
    business_name,
    registered_address,
    zip_code,
    tin_number,
    vat_status,
    status,
    notes
  ) VALUES (
    p_seller_id,
    p_document_type,
    p_document_url,
    p_document_number,
    p_document_expiry_date,
    p_government_id_type,
    p_government_id_url,
    p_seller_type,
    p_first_name,
    p_middle_name,
    p_last_name,
    p_suffix,
    p_business_name,
    p_registered_address,
    p_zip_code,
    p_tin_number,
    p_vat_status,
    'pending',
    'Awaiting verification'
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 