'use strict';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-primary mb-8 text-center">Privacy Policy</h1>

            <div className="prose prose-neutral max-w-none">
                <p className="lead text-lg text-neutral-600 mb-8">
                    At Skoneasu, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">1. Information We Collect</h2>
                    <p className="text-neutral-600 mb-4">
                        We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or contact us for support. This may include:
                    </p>
                    <ul className="list-disc pl-5 text-neutral-600">
                        <li>Name and contact information (email, phone number, address)</li>
                        <li>Payment information (processed securely by our payment providers)</li>
                        <li>Order history and preferences</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">2. How We Use Your Information</h2>
                    <p className="text-neutral-600 mb-4">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-5 text-neutral-600">
                        <li>Process your orders and send order confirmations</li>
                        <li>Provide customer support and respond to your inquiries</li>
                        <li>Send you marketing communications (if you have opted in)</li>
                        <li>Improve our website and services</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">3. Information Sharing</h2>
                    <p className="text-neutral-600">
                        We do not sell your personal information. We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">4. Data Security</h2>
                    <p className="text-neutral-600">
                        We implement a variety of security measures to maintain the safety of your personal information. Your payment information is encrypted using secure socket layer technology (SSL).
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">5. Google Authorization</h2>
                    <p className="text-neutral-600">
                        Our app uses Google's OAuth 2.0 service for authentication. We access basic profile information (name, email, profile picture) to create your account. We do not access your contacts, calendar, or other personal data stored in your Google account.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">6. Contact Us</h2>
                    <p className="text-neutral-600">
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@skoneasu.com" className="text-amber-600 hover:underline">support@skoneasu.com</a>.
                    </p>
                </section>
            </div>
        </div>
    )
}
