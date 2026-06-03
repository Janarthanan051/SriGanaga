import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Spin, Empty, Tag, Input, Badge } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { supabase } from '@/config/supabase';
import { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/cartSlice';

const { Title, Text } = Typography;
const { Meta } = Card;

const Storefront: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'finished_good')
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Menu</Title>
          <Text type="secondary">Order fresh sweets and snacks directly.</Text>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search our menu..."
            prefix={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
      ) : filteredProducts.length === 0 ? (
        <Empty description="No products found" style={{ padding: '50px' }} />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredProducts.map(product => {
            const qty = getCartQuantity(product.id);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Badge count={qty} color="#52c41a" offset={[-10, 10]}>
                  <Card
                    hoverable
                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    cover={
                      <div style={{ height: 160, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Placeholder image, ideally we would have image_url in DB */}
                        <span style={{ fontSize: 48 }}>🍲</span>
                      </div>
                    }
                  >
                    <Meta
                      title={product.name}
                      description={<Tag color="blue">{product.category}</Tag>}
                      style={{ marginBottom: 16 }}
                    />
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        ₹{Number(product.unit_price).toLocaleString()}
                      </Title>
                      <Button 
                        type={qty > 0 ? "default" : "primary"}
                        icon={<PlusOutlined />}
                        onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
                      >
                        Add
                      </Button>
                    </div>
                  </Card>
                </Badge>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default Storefront;
