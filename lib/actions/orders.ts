'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';

interface OrderItemInput {
  product_id: string;
  quantity: number;
}

interface UpdatePaymentInput {
  item_id: string;
  paid_quantity: number;
}

export async function createOrder(
  clientId: string,
  items: OrderItemInput[],
  notes?: string
) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Prepare items with prices for the SQL function
    const itemsWithPrices = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, unit_price')
        .eq('id', item.product_id)
        .eq('user_id', user.id)
        .single();

      if (productError || !product) {
        return { error: `Το προϊόν δεν βρέθηκε` };
      }

      itemsWithPrices.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.unit_price,
      });
    }

    // Call the SQL function to create or update order
    const { data, error } = await supabase.rpc(
      'add_items_to_open_order_or_create',
      {
        p_user_id: user.id,
        p_client_id: clientId,
        p_items: itemsWithPrices,
        p_notes: notes || null,
      }
    );

    if (error) {
      return { error: error.message };
    }

    const result = data?.[0];

    if (!result?.success) {
      return {
        error: result?.message || 'Σφάλμα κατά τη δημιουργία παραγγελίας',
      };
    }

    revalidatePath('/dashboard/orders');
    return {
      success: true,
      orderId: result.order_id,
      message: result.message,
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { error: error.message || 'Σφάλμα κατά τη δημιουργία παραγγελίας' };
  }
}

// Legacy code kept for reference - can be removed later
export async function createOrder_OLD(
  clientId: string,
  items: OrderItemInput[],
  notes?: string
) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Validate items and check stock
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, unit_price, stock_quantity')
        .eq('id', item.product_id)
        .eq('user_id', user.id)
        .single();

      if (productError || !product) {
        return { error: `Το προϊόν δεν βρέθηκε` };
      }

      if (product.stock_quantity < item.quantity) {
        return {
          error: `Ανεπαρκές απόθεμα για ${product.name}. Διαθέσιμο: ${product.stock_quantity}`,
        };
      }

      validatedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.unit_price,
      });

      totalAmount += product.unit_price * item.quantity;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        client_id: clientId,
        status: 'pending',
        total_amount: totalAmount,
        paid_amount: 0,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { error: 'Σφάλμα κατά τη δημιουργία παραγγελίας' };
    }

    // Create order items and update product stock
    for (const item of validatedItems) {
      // Insert order item
      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        paid_quantity: 0,
      });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        return { error: 'Σφάλμα κατά τη δημιουργία στοιχείων παραγγελίας' };
      }

      // Update product stock
      const { error: stockError } = await supabase.rpc(
        'decrease_product_stock',
        {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        }
      );

      if (stockError) {
        console.error('Error updating stock:', stockError);
        return { error: 'Σφάλμα κατά την ενημέρωση αποθέματος' };
      }
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/products');
    return { success: true, data: order };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function getOrders() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        client:clients(id, first_name, last_name, phone),
        order_items(
          id,
          quantity,
          unit_price,
          paid_quantity,
          product:products(id, name)
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

export async function updateOrderPayment(
  orderId: string,
  payments: UpdatePaymentInput[]
) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return { error: 'Η παραγγελία δεν βρέθηκε' };
    }

    // Update paid quantities for each item
    for (const payment of payments) {
      const item = order.order_items.find((i: any) => i.id === payment.item_id);
      if (!item) continue;

      if (payment.paid_quantity > item.quantity) {
        return { error: 'Η πληρωμένη ποσότητα υπερβαίνει την παραγγελθείσα' };
      }

      const { error: updateError } = await supabase
        .from('order_items')
        .update({ paid_quantity: payment.paid_quantity })
        .eq('id', payment.item_id);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return { error: 'Σφάλμα κατά την ενημέρωση πληρωμής' };
      }
    }

    // Recalculate totals for ALL items in the order
    const { data: updatedItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError || !updatedItems) {
      return { error: 'Σφάλμα κατά την ανάκτηση στοιχείων' };
    }

    let totalPaid = 0;
    let totalAmount = 0;

    for (const item of updatedItems) {
      totalPaid += item.unit_price * item.paid_quantity;
      totalAmount += item.unit_price * item.quantity;
    }

    // Determine order status
    let status = 'pending';
    if (totalPaid >= totalAmount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    // Update order
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        paid_amount: totalPaid,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError);
      return { error: 'Σφάλμα κατά την ενημέρωση παραγγελίας' };
    }

    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function payFullOrder(orderId: string) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return { error: 'Η παραγγελία δεν βρέθηκε' };
    }

    if (order.status === 'paid') {
      return { error: 'Η παραγγελία είναι ήδη πλήρως πληρωμένη' };
    }

    // Mark all items as fully paid
    for (const item of order.order_items) {
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ paid_quantity: item.quantity })
        .eq('id', item.id);

      if (updateError) {
        console.error('Error updating item payment:', updateError);
        return { error: 'Σφάλμα κατά την ενημέρωση πληρωμής' };
      }
    }

    // Calculate total paid amount (all items fully paid)
    const totalPaid = order.order_items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // Update order status to paid
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        paid_amount: totalPaid,
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError);
      return { error: 'Σφάλμα κατά την ενημέρωση παραγγελίας' };
    }

    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function cancelOrderItem(itemId: string, orderId: string) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Get order item
    const { data: item, error: itemError } = await supabase
      .from('order_items')
      .select('*, order:orders(user_id)')
      .eq('id', itemId)
      .single();

    if (itemError || !item || item.order.user_id !== user.id) {
      return { error: 'Το στοιχείο δεν βρέθηκε' };
    }

    // Calculate quantity to return (unpaid quantity)
    const unpaidQuantity = item.quantity - item.paid_quantity;

    if (unpaidQuantity > 0) {
      // Return stock for unpaid items
      const { error: stockError } = await supabase.rpc(
        'increase_product_stock',
        {
          p_product_id: item.product_id,
          p_quantity: unpaidQuantity,
        }
      );

      if (stockError) {
        console.error('Error updating stock:', stockError);
        return { error: 'Σφάλμα κατά την ενημέρωση αποθέματος' };
      }
    }

    // Update item quantity to paid quantity (effectively cancelling unpaid items)
    const { error: updateError } = await supabase
      .from('order_items')
      .update({ quantity: item.paid_quantity })
      .eq('id', itemId);

    if (updateError) {
      console.error('Error updating item:', updateError);
      return { error: 'Σφάλμα κατά την ακύρωση στοιχείου' };
    }

    // Recalculate order totals
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('quantity, unit_price, paid_quantity')
      .eq('order_id', orderId);

    if (!itemsError && orderItems) {
      const totalAmount = orderItems.reduce(
        (sum, i) => sum + i.unit_price * i.quantity,
        0
      );
      const paidAmount = orderItems.reduce(
        (sum, i) => sum + i.unit_price * i.paid_quantity,
        0
      );

      let status = 'pending';
      if (totalAmount === 0) {
        status = 'cancelled';
      } else if (paidAmount >= totalAmount) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partial';
      }

      await supabase
        .from('orders')
        .update({
          total_amount: totalAmount,
          paid_amount: paidAmount,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Get order items to return stock
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity, paid_quantity')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return { error: 'Σφάλμα κατά την ακύρωση παραγγελίας' };
    }

    // Return stock for all unpaid items
    for (const item of items || []) {
      const unpaidQuantity = item.quantity - item.paid_quantity;
      if (unpaidQuantity > 0) {
        await supabase.rpc('increase_product_stock', {
          p_product_id: item.product_id,
          p_quantity: unpaidQuantity,
        });
      }
    }

    // Delete order items first (due to foreign key constraint)
    const { error: deleteItemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteItemsError) {
      console.error('Error deleting order items:', deleteItemsError);
      return { error: 'Σφάλμα κατά τη διαγραφή των στοιχείων παραγγελίας' };
    }

    // Delete the order
    const { error: deleteOrderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (deleteOrderError) {
      console.error('Error deleting order:', deleteOrderError);
      return { error: 'Σφάλμα κατά τη διαγραφή παραγγελίας' };
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  newQuantity: number
) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Get the current order item
    const { data: currentItem, error: itemError } = await supabase
      .from('order_items')
      .select('quantity, product_id')
      .eq('id', itemId)
      .eq('order_id', orderId)
      .single();

    if (itemError || !currentItem) {
      return { error: 'Το στοιχείο παραγγελίας δεν βρέθηκε' };
    }

    const quantityDifference = newQuantity - currentItem.quantity;

    // Update the order item quantity
    const { error: updateError } = await supabase
      .from('order_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)
      .eq('order_id', orderId);

    if (updateError) {
      return { error: 'Σφάλμα κατά την ενημέρωση της ποσότητας' };
    }

    // Adjust product stock
    if (quantityDifference !== 0) {
      const { error: stockError } = await supabase.rpc('adjust_product_stock', {
        product_id: currentItem.product_id,
        quantity_change: -quantityDifference, // Negative because we're returning stock
      });

      if (stockError) {
        console.error('Error adjusting stock:', stockError);
        return { error: 'Σφάλμα κατά την ενημέρωση του αποθέματος' };
      }
    }

    // Recalculate order totals
    await recalculateOrderTotals(orderId);

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function deleteOrderItem(orderId: string, itemId: string) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Get the current order item to return stock
    const { data: currentItem, error: itemError } = await supabase
      .from('order_items')
      .select('quantity, paid_quantity, product_id')
      .eq('id', itemId)
      .eq('order_id', orderId)
      .single();

    if (itemError || !currentItem) {
      return { error: 'Το στοιχείο παραγγελίας δεν βρέθηκε' };
    }

    // Return unpaid stock to product
    const unpaidQuantity = currentItem.quantity - currentItem.paid_quantity;
    if (unpaidQuantity > 0) {
      const { error: stockError } = await supabase.rpc('adjust_product_stock', {
        product_id: currentItem.product_id,
        quantity_change: unpaidQuantity,
      });

      if (stockError) {
        console.error('Error returning stock:', stockError);
        return { error: 'Σφάλμα κατά την επιστροφή του αποθέματος' };
      }
    }

    // Delete the order item
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId)
      .eq('order_id', orderId);

    if (deleteError) {
      return { error: 'Σφάλμα κατά τη διαγραφή του στοιχείου' };
    }

    // Check if order has any items left
    const { data: remainingItems, error: countError } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', orderId);

    if (countError) {
      console.error('Error checking remaining items:', countError);
    }

    // If no items left, cancel the order
    if (!remainingItems || remainingItems.length === 0) {
      const { error: cancelError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (cancelError) {
        console.error('Error cancelling empty order:', cancelError);
      }
    } else {
      // Recalculate order totals
      await recalculateOrderTotals(orderId);
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

async function recalculateOrderTotals(orderId: string) {
  try {
    const supabase = await getServerSupabase();

    // Get all order items with their current data
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('unit_price, quantity, paid_quantity')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return;
    }

    if (!items || items.length === 0) {
      return;
    }

    // Calculate new totals
    let totalAmount = 0;
    let paidAmount = 0;

    for (const item of items) {
      const itemTotal = item.unit_price * item.quantity;
      const itemPaid = item.unit_price * item.paid_quantity;
      totalAmount += itemTotal;
      paidAmount += itemPaid;
    }

    // Determine order status
    let status = 'pending';
    if (paidAmount === 0) {
      status = 'pending';
    } else if (paidAmount >= totalAmount) {
      status = 'paid';
    } else {
      status = 'partial';
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        total_amount: totalAmount,
        paid_amount: paidAmount,
        status: status,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order totals:', updateError);
    }
  } catch (error) {
    console.error('Error recalculating order totals:', error);
  }
}

export async function getDashboardData() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get total sales and other stats
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, paid_amount, status, created_at')
      .eq('user_id', user.id);

    if (ordersError) {
      console.error('Error fetching orders for dashboard:', ordersError);
      return null;
    }

    // Calculate stats
    const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const totalPaid = orders?.reduce((sum, order) => sum + (order.paid_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    // Count orders by status
    const completedOrders = orders?.filter(order => order.status === 'paid').length || 0;
    const pendingOrders = orders?.filter(order => order.status === 'partial' || order.status === 'pending').length || 0;

    // Calculate completion rate
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    // Get recent orders (last 5)
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        paid_amount,
        status,
        created_at,
        notes,
        client:clients(id, first_name, last_name, phone),
        order_items(
          id,
          quantity,
          unit_price,
          paid_quantity,
          product:products(id, name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent orders:', recentError);
      return null;
    }

    // Get active customers count
    const { data: customers, error: customersError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id);

    const activeCustomers = customers?.length || 0;

    return {
      stats: {
        totalSales,
        totalPaid,
        totalOrders,
        completedOrders,
        pendingOrders,
        completionRate,
        activeCustomers,
      },
      recentOrders: recentOrders || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
}
