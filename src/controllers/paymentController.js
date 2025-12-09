import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user._id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        // 1. Validate items and calculate total from DB to prevent price tampering
        let totalAmount = 0;
        const lineItems = [];
        const orderProducts = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.productId}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            totalAmount += product.price * item.quantity;

            // Stripe line item
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
                    },
                    unit_amount: Math.round(product.price * 100), // Stripe expects cents
                },
                quantity: item.quantity,
            });

            // Order product format
            orderProducts.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // 2. Create pending Order
        const order = new Order({
            customerId: userId,
            products: orderProducts,
            totalPrice: totalAmount,
            status: 'pending',
            stripeSessionId: '' // Will update after session creation
        });
        await order.save();

        // 3. Create pending Payment
        const payment = new Payment({
            orderId: order._id,
            customerId: userId,
            amount: totalAmount,
            paymentMethod: 'stripe',
            paymentStatus: 'pending'
        });
        await payment.save();

        // 4. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/failure`,
            client_reference_id: order._id.toString(),
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString(),
                paymentId: payment._id.toString()
            }
        });

        // Update order with session ID
        order.stripeSessionId = session.id;
        await order.save();

        res.json({ url: session.url, sessionId: session.id });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};

export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;

        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = 'confirmed'; // Or 'paid' if you have that status
                await order.save();

                // Update Payment status
                const payment = await Payment.findOne({ orderId: orderId });
                if (payment) {
                    payment.paymentStatus = 'completed';
                    payment.transactionId = session.payment_intent;
                    payment.paymentDate = new Date();
                    await payment.save();
                }

                // Decrease stock
                for (const item of order.products) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }
        } catch (error) {
            console.error('Error updating order after payment:', error);
            // Don't return error to Stripe, otherwise it will retry. Just log it.
        }
    }

    res.json({ received: true });
};
