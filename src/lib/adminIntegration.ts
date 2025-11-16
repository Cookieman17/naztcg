import { useEffect } from 'react';
import { initializeDataPersistence } from './dataPersistence';

// Admin integration utility for handling order events and data management
export const useAdminIntegration = () => {
  useEffect(() => {
    // Initialize data persistence system
    initializeDataPersistence();
    
    // Initialize sample data on first load
    initializeSampleData();
    
    // Listen for order creation events from the payment system
    const handleOrderCreated = (event: CustomEvent) => {
      const orderData = event.detail;
      
      // Add to admin orders
      const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
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
      
      existingOrders.unshift(newOrder);
      localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
      
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
  const customers = JSON.parse(localStorage.getItem('adminCustomers') || '[]');
  const existingCustomerIndex = customers.findIndex((c: any) => c.email === order.email);
  
  if (existingCustomerIndex >= 0) {
    // Update existing customer
    const customer = customers[existingCustomerIndex];
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + order.total;
    customer.lastOrderDate = order.createdAt;
    customer.orders = customer.orders || [];
    customer.orders.push({
      id: order.id,
      total: order.total,
      date: order.createdAt,
      status: order.status
    });
  } else {
    // Create new customer
    const newCustomer = {
      id: order.email,
      name: order.customerName || order.email,
      email: order.email,
      totalOrders: 1,
      totalSpent: order.total,
      firstOrderDate: order.createdAt,
      lastOrderDate: order.createdAt,
      status: 'active',
      orders: [{
        id: order.id,
        total: order.total,
        date: order.createdAt,
        status: order.status
      }]
    };
    customers.push(newCustomer);
  }
  
  localStorage.setItem('adminCustomers', JSON.stringify(customers));
};

// Function to dispatch order created events
export const dispatchOrderCreatedEvent = (orderData: any) => {
  const event = new CustomEvent('orderCreated', {
    detail: orderData
  });
  window.dispatchEvent(event);
};

// Initialize sample data if none exists
export const initializeSampleData = () => {
  // Sample products
  if (!localStorage.getItem('adminProducts')) {
    const sampleProducts = [
      {
        id: Date.now().toString(),
        name: 'PSA Card Grading Service',
        description: 'Professional card grading and authentication service',
        price: 25.00,
        category: 'Grading',
        series: '',
        rarity: '',
        stock: 100,
        image: '/api/placeholder/300/200',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: (Date.now() + 1).toString(),
        name: 'BGS Card Grading Service',
        description: 'Beckett Grading Services authentication',
        price: 30.00,
        category: 'Grading',
        series: '',
        rarity: '',
        stock: 75,
        image: '/api/placeholder/300/200',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: (Date.now() + 2).toString(),
        name: 'Card Sleeves (100 pack)',
        description: 'Premium card protection sleeves',
        price: 12.99,
        category: 'Accessories',
        series: '',
        rarity: '',
        stock: 50,
        image: '/api/placeholder/300/200',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('adminProducts', JSON.stringify(sampleProducts));
  }

  // Initialize empty arrays for orders and customers if they don't exist
  if (!localStorage.getItem('adminOrders')) {
    localStorage.setItem('adminOrders', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('adminCustomers')) {
    localStorage.setItem('adminCustomers', JSON.stringify([]));
  }
};