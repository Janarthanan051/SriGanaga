import React from 'react';
import { Layout, Menu, Badge, Button } from 'antd';
import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { toggleCart } from '@/redux/cartSlice';
import CartDrawer from './CartDrawer';

const { Header, Content, Footer } = Layout;

const StoreLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0 50px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/store')}>
          <ShopOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
          <h2 style={{ margin: 0, color: '#1890ff', fontWeight: 'bold' }}>Sri Ganga Foods</h2>
        </div>
        
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]} 
          style={{ flex: 1, justifyContent: 'center', borderBottom: 'none' }}
          items={[
            { key: '/store', label: 'Menu', onClick: () => navigate('/store') },
            { key: '/store/track', label: 'Track Order', onClick: () => navigate('/store/track') }
          ]}
        />
        
        <div>
          <Badge count={totalItems}>
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />} 
              size="large"
              onClick={() => dispatch(toggleCart())}
            >
              Cart
            </Button>
          </Badge>
        </div>
      </Header>
      
      <Content style={{ padding: '0 50px', marginTop: '24px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 380, borderRadius: '8px' }}>
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        Sri Ganga Foods ©{new Date().getFullYear()} - Fresh & Delicious
      </Footer>

      <CartDrawer />
    </Layout>
  );
};

export default StoreLayout;
