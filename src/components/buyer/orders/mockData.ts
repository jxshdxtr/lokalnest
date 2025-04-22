
import { Order } from './types';

export const mockOrders: Order[] = [
  {
    id: "ORD-8294",
    date: "2023-10-25",
    items: [
      {
        name: "Handwoven Cotton Tote Bag",
        quantity: 1,
        price: 850,
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2670&q=80",
      },
      {
        name: "Bamboo Serving Tray",
        quantity: 1,
        price: 650,
        image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=2670&q=80",
      }
    ],
    total: 1500,
    status: 'shipped',
    tracking: {
      id: "TRK-5862",
      courier: "Philippine Express",
      url: "#track-url",
      estimatedDelivery: "2023-10-30",
      currentLocation: "Manila Sorting Facility",
      updates: [
        {
          status: "Order Processed",
          location: "Warehouse",
          timestamp: "Oct 26, 2023 - 09:15 AM"
        },
        {
          status: "Picked Up",
          location: "Iloilo City",
          timestamp: "Oct 27, 2023 - 10:23 AM"
        },
        {
          status: "In Transit",
          location: "Manila Sorting Facility",
          timestamp: "Oct 28, 2023 - 03:45 PM"
        }
      ]
    }
  },
  {
    id: "ORD-7392",
    date: "2023-10-15",
    items: [
      {
        name: "Handcrafted Wooden Bowls (Set of 3)",
        quantity: 1,
        price: 1200,
        image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=2670&q=80",
      }
    ],
    total: 1200,
    status: 'delivered',
    tracking: {
      id: "TRK-3921",
      courier: "Philippine Express",
      url: "#track-url",
      estimatedDelivery: "2023-10-20",
      updates: [
        {
          status: "Order Processed",
          location: "Warehouse",
          timestamp: "Oct 16, 2023 - 10:30 AM"
        },
        {
          status: "Picked Up",
          location: "Cebu City",
          timestamp: "Oct 17, 2023 - 09:15 AM"
        },
        {
          status: "In Transit",
          location: "Manila Sorting Facility",
          timestamp: "Oct 18, 2023 - 02:20 PM"
        },
        {
          status: "Out for Delivery",
          location: "Local Delivery Center",
          timestamp: "Oct 19, 2023 - 08:45 AM"
        },
        {
          status: "Delivered",
          location: "Customer Address",
          timestamp: "Oct 19, 2023 - 02:30 PM"
        }
      ]
    }
  },
  {
    id: "ORD-6104",
    date: "2023-09-30",
    items: [
      {
        name: "Hand-painted Ceramic Mug",
        quantity: 2,
        price: 450,
        image: "https://images.unsplash.com/photo-1547619292-8816ee7cdd50?auto=format&fit=crop&w=2670&q=80",
      }
    ],
    total: 900,
    status: 'processing'
  }
];
