import React from 'react';
import { Drawer, List, Button, Typography, Space, InputNumber, Divider, Empty } from 'antd';
import { DeleteOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { removeFromCart, updateQuantity, setCartOpen } from '@/redux/cartSlice';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isOpen } = useAppSelector(state => state.cart);

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.product.unit_price) * item.quantity), 0);

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    navigate('/store/checkout');
  };

  return (
    <Drawer
      title="Your Shopping Cart"
      placement="right"
      onClose={() => dispatch(setCartOpen(false))}
      open={isOpen}
      width={400}
    >
      {items.length === 0 ? (
        <Empty description="Your cart is empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => dispatch(removeFromCart(item.product.id))}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={item.product.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">₹{Number(item.product.unit_price).toLocaleString()} / {item.product.unit}</Text>
                        <Space>
                          <InputNumber 
                            min={1} 
                            value={item.quantity} 
                            onChange={(val) => {
                              if (val) dispatch(updateQuantity({ productId: item.product.id, quantity: val }));
                            }}
                            size="small"
                          />
                        </Space>
                      </Space>
                    }
                  />
                  <div style={{ fontWeight: 'bold' }}>
                    ₹{(Number(item.product.unit_price) * item.quantity).toLocaleString()}
                  </div>
                </List.Item>
              )}
            />
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '16px' }}>Total Amount:</Text>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>₹{totalAmount.toLocaleString()}</Title>
            </Row>
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<CreditCardOutlined />}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

// Import Row here since it's used inside
import { Row } from 'antd';

export default CartDrawer;
