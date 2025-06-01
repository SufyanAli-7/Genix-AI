import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('Checkout session:', {
        id: session.id,
        userId: session?.metadata?.userId,
        subscription: session.subscription,
        mode: session.mode,
      });

      if (!session?.metadata?.userId) {
        console.log('Missing userId in session metadata');
        return new NextResponse('User ID is required', { status: 400 });
      }

      if (!session.subscription) {
        console.log('No subscription found in checkout session');
        return new NextResponse('No subscription found in session', { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      console.log('Retrieved subscription for checkout:', {
        id: subscription.id,
        customer: subscription.customer,
        current_period_end: (subscription as any).current_period_end, // ✅ Fix: Type assertion
        status: subscription.status,
      });

      // ✅ Fix: Handle missing current_period_end with fallback using type assertion
      let currentPeriodEnd = (subscription as any).current_period_end;
      
      if (!currentPeriodEnd) {
        console.log('Missing current_period_end, using fallback date');
        // ✅ Create fallback date (30 days from now)
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 30);
        currentPeriodEnd = Math.floor(fallbackDate.getTime() / 1000);
      }

      await prismadb.userSubscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
        },
      });

      console.log('Successfully created user subscription');
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;

      console.log('Invoice payment succeeded:', {
        id: invoice.id,
        subscription: (invoice as any).subscription, // ✅ Fix: Type assertion
        customer: invoice.customer,
        amount_paid: invoice.amount_paid,
      });

      // ✅ Fix: Use type assertion to access subscription property
      const invoiceSubscription = (invoice as any).subscription;
      
      if (!invoiceSubscription || typeof invoiceSubscription !== 'string') {
        console.log('No valid subscription found in invoice, skipping...');
        return new NextResponse(null, { status: 200 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        invoiceSubscription as string
      );

      console.log('Retrieved subscription for invoice:', {
        id: subscription.id,
        current_period_end: (subscription as any).current_period_end, // ✅ Fix: Type assertion
        status: subscription.status,
      });

      // ✅ Fix: Use type assertion for current_period_end
      const currentPeriodEnd = (subscription as any).current_period_end;
      if (!currentPeriodEnd) {
        console.log('Invalid subscription period for invoice, using fallback');
        // ✅ Use invoice date as fallback
        const fallbackDate = new Date();
        fallbackDate.setMonth(fallbackDate.getMonth() + 1); // Add 1 month

        await prismadb.userSubscription.updateMany({
          where: {
            stripeCustomerId: invoice.customer as string,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: fallbackDate,
          },
        });

        console.log('Updated subscription with fallback date');
        return new NextResponse(null, { status: 200 });
      }

      await prismadb.userSubscription.updateMany({
        where: {
          stripeCustomerId: invoice.customer as string,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
        },
      });

      console.log('Successfully updated user subscription');
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error('[WEBHOOK_ERROR]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}