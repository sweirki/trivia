const functions = require('firebase-functions');
const stripe = require('stripe')('YOUR_SECRET_KEY');

exports.stripeCheckout = functions.https.onRequest(async (req, res) => {
  const { packId } = req.query;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Pack ${packId}` },
        unit_amount: 499,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://yourapp.com/success',
    cancel_url: 'https://yourapp.com/cancel',
  });
  res.json({ url: session.url });
});