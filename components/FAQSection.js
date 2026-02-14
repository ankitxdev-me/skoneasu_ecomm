'use strict';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
    const faqs = [
        {
            question: "How do I find the perfect fit?",
            answer: "We provide detailed size guides for both men and women on every product page, including measurements for chest, waist, and hips. If you're between sizes or need specific advice, our styling team is happy to help you find the ideal fit."
        },
        {
            question: "What materials do you use?",
            answer: "We prioritize premium, sustainable fabrics. Our collections feature high-grade cottons, pure linens, ethically sourced wools, and durable blends designed for both comfort and longevity. Specific material details are listed under each product."
        },
        {
            question: "Do you offer styling advice?",
            answer: "Yes! We believe fashion is personal. Check out our 'Style Journal' for the latest trends and outfit inspiration. For personalized advice, you can reach out to our customer support for tips on how to mix and match our pieces."
        },
        {
            question: "What is your return policy for clothing?",
            answer: "We want you to love your look. You can return any unworn, unwashed items with original tags attached within 7 days of delivery. We offer easy exchanges if you need a different size or color."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we bring our latest styles to fashion enthusiasts worldwide. Shipping rates and delivery times vary by destination, but we strive to get your new favorite pieces to you as quickly as possible."
        }
    ]

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-neutral-600">
                        Everything you need to know about our collections, sizing, and services.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left text-lg font-medium text-primary hover:text-amber-600 transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-neutral-600 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
