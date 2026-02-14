'use strict';

export default function ShippingPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-primary mb-8 text-center">Shipping & Returns</h1>

            <div className="prose prose-neutral max-w-none">

                {/* Shipping Policy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Shipping Policy</h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Processing Time</h3>
                        <p className="text-neutral-600">
                            All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
                            If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Shipping Rates & Delivery Estimates</h3>
                        <p className="text-neutral-600 mb-4">
                            Shipping charges for your order will be calculated and displayed at checkout.
                        </p>
                        <ul className="list-disc pl-5 text-neutral-600 space-y-2">
                            <li><strong>Standard Shipping:</strong> 5-7 business days - Free for orders over ₹999</li>
                            <li><strong>Express Shipping:</strong> 2-3 business days - Flat rate of ₹150</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Shipment Confirmation & Order Tracking</h3>
                        <p className="text-neutral-600">
                            You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">International Shipping</h3>
                        <p className="text-neutral-600">
                            We currently ship to select countries worldwide. International shipping rates and times vary by location. Please note that customs duties and taxes are the responsibility of the customer.
                        </p>
                    </div>
                </section>

                {/* Returns Policy */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Returns Policy</h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">7-Day Return Policy</h3>
                        <p className="text-neutral-600">
                            We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Eligibility for Returns</h3>
                        <p className="text-neutral-600 mb-2">
                            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
                        </p>
                        <p className="text-neutral-600">
                            Items sent back to us without first requesting a return will not be accepted.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">How to Start a Return</h3>
                        <p className="text-neutral-600">
                            To start a return, you can contact us at <a href="mailto:support@skoneasu.com" className="text-amber-600 hover:underline">support@skoneasu.com</a>. If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Damages and Issues</h3>
                        <p className="text-neutral-600">
                            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Exchanges</h3>
                        <p className="text-neutral-600">
                            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Refunds</h3>
                        <p className="text-neutral-600">
                            We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method. Please remember it can take some time for your bank or credit card company to process and post the refund too.
                        </p>
                    </div>

                </section>
            </div>
        </div>
    )
}
