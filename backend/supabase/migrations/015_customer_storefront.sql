-- 015_customer_storefront.sql
-- Function to allow public (unauthenticated/guest) users to submit a food order safely

CREATE OR REPLACE FUNCTION public.submit_customer_order(
    p_customer_name VARCHAR(255),
    p_customer_phone VARCHAR(50),
    p_customer_address TEXT,
    p_items JSONB -- Array of { product_id: UUID, quantity: NUMERIC }
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres) so it bypasses RLS
AS $$
DECLARE
    v_customer_id UUID;
    v_order_id UUID;
    v_order_number VARCHAR(100);
    v_total_amount DECIMAL(12, 2) := 0.00;
    v_item RECORD;
    v_product RECORD;
    v_item_total DECIMAL(12, 2);
BEGIN
    -- 1. Find or Create Customer
    SELECT id INTO v_customer_id FROM public.customers WHERE phone = p_customer_phone LIMIT 1;
    
    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (name, phone, shipping_address, billing_address)
        VALUES (p_customer_name, p_customer_phone, p_customer_address, p_customer_address)
        RETURNING id INTO v_customer_id;
    ELSE
        -- Update existing customer's address just in case
        UPDATE public.customers 
        SET shipping_address = p_customer_address, billing_address = p_customer_address, name = p_customer_name
        WHERE id = v_customer_id;
    END IF;

    -- 2. Generate Order Number
    v_order_number := 'ORD-STORE-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS');

    -- 3. Create Sales Order (Initial Total 0)
    INSERT INTO public.sales_orders (order_number, customer_id, status, total_amount, order_date, notes)
    VALUES (v_order_number, v_customer_id, 'pending', 0.00, CURRENT_DATE, 'Online Guest Order')
    RETURNING id INTO v_order_id;

    -- 4. Process Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC)
    LOOP
        -- Fetch current product price from DB to prevent client spoofing
        SELECT id, unit_price INTO v_product FROM public.products WHERE id = v_item.product_id;
        
        IF v_product.id IS NOT NULL THEN
            v_item_total := v_product.unit_price * v_item.quantity;
            v_total_amount := v_total_amount + v_item_total;
            
            INSERT INTO public.sales_order_items (sales_order_id, product_id, quantity, unit_price, total_price)
            VALUES (v_order_id, v_product.id, v_item.quantity, v_product.unit_price, v_item_total);
        END IF;
    END LOOP;

    -- 5. Update Total Amount
    UPDATE public.sales_orders SET total_amount = v_total_amount WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;

-- Grant execute to public/anon role
GRANT EXECUTE ON FUNCTION public.submit_customer_order TO anon, authenticated;

-- Reload schema
NOTIFY pgrst, 'reload schema';
