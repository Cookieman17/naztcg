import { useEffect } from 'react';
import { firebaseProductService } from './firebase-products';
import { firebaseCartService } from './firebase-cart';

// Admin integration utility for handling order events and data management
export const useAdminIntegration = () => {
  useEffect(() => {
    // Initialize Firebase sample data if needed (disabled by default)
    // initializeSampleData();
    
    // Listen for order creation events from the payment system
    const handleOrderCreated = (event: CustomEvent) => {
      const orderData = event.detail;
      
      // TODO: Add Firebase orders collection when order management is implemented
      const newOrder = {
        id: orderData.id || Date.now().toString(),
        customerName: orderData.customerName || orderData.email,
        email: orderData.email,
        total: orderData.total,
        status: 'pending',
        items: orderData.items || [],
        shippingAddress: orderData.shippingAddress || {
          street: '',
          city: '',
          postcode: '',
          country: 'United Kingdom'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🔥 Order created (Firebase orders collection not yet implemented):', newOrder);
      
      // Update customer data
      updateCustomerData(newOrder);
    };

    // Listen for custom order events
    window.addEventListener('orderCreated', handleOrderCreated as EventListener);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated as EventListener);
    };
  }, []);
};

// Function to update customer data when orders are created
const updateCustomerData = (order: any) => {
  // TODO: Implement Firebase customers collection when customer management is added
  console.log('🔥 Customer data update (Firebase customers collection not yet implemented):', {
    email: order.email,
    name: order.customerName,
    orderTotal: order.total
  });
};

// Function to dispatch order created events
export const dispatchOrderCreatedEvent = (orderData: any) => {
  const event = new CustomEvent('orderCreated', {
    detail: orderData
  });
  window.dispatchEvent(event);
};

// Initialize sample data in Firebase if none exists
export const initializeSampleData = async () => {
  try {
    // Check if Firebase has any products
    const products = await firebaseProductService.getProducts();
    
    if (products.length === 0) {
      console.log('🔥 Creating initial sample products in Firebase');
      const sampleProducts = [
        {
          name: 'PSA Card Grading Service',
          description: 'Professional card grading and authentication service',
          price: 25.00,
          category: 'Grading',
          series: '',
          rarity: '',
          stock: 100,
          image_url: '/api/placeholder/300/200',
          status: 'active'
        },
        {
          name: 'BGS Card Grading Service',
          description: 'Beckett Grading Services authentication',
          price: 30.00,
          category: 'Grading',
          series: '',
          rarity: '',
          stock: 75,
          image_url: '/api/placeholder/300/200',
          status: 'active'
        },
        {
          name: 'Card Sleeves (100 pack)',
          description: 'Premium card protection sleeves',
          price: 12.99,
          category: 'Accessories',
          series: '',
          rarity: '',
          stock: 50,
          image_url: '/api/placeholder/300/200',
          status: 'active'
        }
      ];
      
      // Create sample products in Firebase
      for (const product of sampleProducts) {
        await firebaseProductService.createProduct(product);
      }
      
      console.log('🔥 Sample products created in Firebase');
    } else {
      console.log('🔥 Firebase already has products, skipping sample data');
    }
  } catch (error) {
    console.error('🔥 Error initializing Firebase sample data:', error);
  }
};