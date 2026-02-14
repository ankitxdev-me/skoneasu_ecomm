'use strict';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-primary mb-8 text-center">Terms & Conditions</h1>

            <div className="prose prose-neutral max-w-none">
                <p className="lead text-lg text-neutral-600 mb-8">
                    Welcome to Skoneasu. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully before making a purchase.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">1. General Conditions</h2>
                    <p className="text-neutral-600">
                        We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (excluding credit card information) may be transferred unencrypted and involve transmissions over various networks.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">2. Products and Services</h2>
                    <p className="text-neutral-600">
                        We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
                        We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">3. Pricing and Billing</h2>
                    <p className="text-neutral-600">
                        Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
                        We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">4. Returns and Refunds</h2>
                    <p className="text-neutral-600">
                        Our policy lasts 7 days. If 7 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange. To be eligible for a return, your item must be unused and in the same condition that you received it.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">5. User Comments and Feedback</h2>
                    <p className="text-neutral-600">
                        If, at our request, you send certain specific submissions or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise, you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">6. Contact Information</h2>
                    <p className="text-neutral-600">
                        Questions about the Terms of Service should be sent to us at <a href="mailto:support@skoneasu.com" className="text-amber-600 hover:underline">support@skoneasu.com</a>.
                    </p>
                </section>
            </div>
        </div>
    )
}
