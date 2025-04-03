
-- These are stored procedures to provide API compatibility
-- while we wait for TypeScript type definitions to be updated

-- Function to get seller customers
CREATE OR REPLACE FUNCTION public.get_seller_customers(seller_id_param UUID)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  total_orders INTEGER,
  total_spent NUMERIC,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  tags TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    sc.customer_id AS profile_id,
    p.full_name,
    p.email,
    p.avatar_url,
    sc.total_orders,
    sc.total_spent,
    sc.last_purchase_date,
    sc.status,
    sc.tags
  FROM 
    public.seller_customers sc
  JOIN 
    public.profiles p ON sc.customer_id = p.id
  WHERE 
    sc.seller_id = seller_id_param;
END;
$$;

-- Function to update customer status
CREATE OR REPLACE FUNCTION public.update_customer_status(
  customer_id_param UUID,
  seller_id_param UUID,
  status_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.seller_customers
  SET 
    status = status_param,
    updated_at = now()
  WHERE 
    customer_id = customer_id_param AND
    seller_id = seller_id_param;
END;
$$;

-- Function to get seller promotions
CREATE OR REPLACE FUNCTION public.get_seller_promotions(seller_id_param UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  discount_value NUMERIC,
  discount_type TEXT,
  coupon_code TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  minimum_purchase NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER,
  applies_to TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    p.id,
    p.title,
    p.description,
    p.discount_value,
    p.discount_type,
    p.coupon_code,
    p.start_date,
    p.end_date,
    p.minimum_purchase,
    p.usage_limit,
    p.usage_count,
    p.applies_to,
    p.is_active,
    p.created_at
  FROM 
    public.promotions p
  WHERE 
    p.seller_id = seller_id_param
  ORDER BY
    p.created_at DESC;
END;
$$;

-- Function to delete a promotion
CREATE OR REPLACE FUNCTION public.delete_promotion(promotion_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.promotions
  WHERE id = promotion_id_param;
END;
$$;

-- Function to update promotion status
CREATE OR REPLACE FUNCTION public.update_promotion_status(
  promotion_id_param UUID,
  is_active_param BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promotions
  SET 
    is_active = is_active_param,
    updated_at = now()
  WHERE 
    id = promotion_id_param;
END;
$$;

-- Function to update an existing promotion
CREATE OR REPLACE FUNCTION public.update_promotion(
  promotion_id_param UUID,
  title_param TEXT,
  description_param TEXT,
  discount_value_param NUMERIC,
  discount_type_param TEXT,
  start_date_param TIMESTAMP WITH TIME ZONE,
  end_date_param TIMESTAMP WITH TIME ZONE,
  is_active_param BOOLEAN,
  coupon_code_param TEXT,
  minimum_purchase_param NUMERIC DEFAULT 0,
  usage_limit_param INTEGER DEFAULT NULL,
  applies_to_param TEXT DEFAULT 'all'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promotions
  SET 
    title = title_param,
    description = description_param,
    discount_value = discount_value_param,
    discount_type = discount_type_param,
    start_date = start_date_param,
    end_date = end_date_param,
    is_active = is_active_param,
    coupon_code = coupon_code_param,
    minimum_purchase = minimum_purchase_param,
    usage_limit = usage_limit_param,
    applies_to = applies_to_param,
    updated_at = now()
  WHERE 
    id = promotion_id_param;
END;
$$;

-- Function to create a new promotion
CREATE OR REPLACE FUNCTION public.create_promotion(
  seller_id_param UUID,
  title_param TEXT,
  description_param TEXT,
  discount_value_param NUMERIC,
  discount_type_param TEXT,
  start_date_param TIMESTAMP WITH TIME ZONE,
  end_date_param TIMESTAMP WITH TIME ZONE,
  coupon_code_param TEXT,
  minimum_purchase_param NUMERIC DEFAULT 0,
  usage_limit_param INTEGER DEFAULT NULL,
  applies_to_param TEXT DEFAULT 'all'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_promotion_id UUID;
BEGIN
  INSERT INTO public.promotions (
    seller_id,
    title,
    description,
    discount_value,
    discount_type,
    start_date,
    end_date,
    coupon_code,
    minimum_purchase,
    usage_limit,
    usage_count,
    applies_to,
    is_active
  ) VALUES (
    seller_id_param,
    title_param,
    description_param,
    discount_value_param,
    discount_type_param,
    start_date_param,
    end_date_param,
    coupon_code_param,
    minimum_purchase_param,
    usage_limit_param,
    0,
    applies_to_param,
    true
  )
  RETURNING id INTO new_promotion_id;
  
  RETURN new_promotion_id;
END;
$$;

-- Function to get inventory logs
CREATE OR REPLACE FUNCTION public.get_inventory_logs(seller_id_param UUID)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name TEXT,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  change_quantity INTEGER,
  reason TEXT,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    il.id,
    il.product_id,
    p.name AS product_name,
    il.previous_quantity,
    il.new_quantity,
    il.change_quantity,
    il.reason,
    il.created_by,
    pr.full_name AS created_by_name,
    il.created_at
  FROM 
    public.inventory_logs il
  JOIN 
    public.products p ON il.product_id = p.id
  LEFT JOIN
    public.profiles pr ON il.created_by = pr.id
  WHERE 
    p.seller_id = seller_id_param
  ORDER BY
    il.created_at DESC;
END;
$$;

-- Function to update product stock
CREATE OR REPLACE FUNCTION public.update_product_stock(
  product_id_param UUID,
  new_quantity_param INTEGER,
  reason_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current stock quantity
  SELECT stock_quantity INTO current_quantity
  FROM public.products
  WHERE id = product_id_param;
  
  -- Update product stock
  UPDATE public.products
  SET stock_quantity = new_quantity_param
  WHERE id = product_id_param;
  
  -- Log is automatically created by the trigger
END;
$$;
