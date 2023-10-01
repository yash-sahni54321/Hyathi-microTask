export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequestBody {
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: Date;
}

export interface UpdateOrderRequestBody {
  status: string;
}

export interface OrderResponse {
  success: boolean;
  order?: any;
  error?: string;
}
