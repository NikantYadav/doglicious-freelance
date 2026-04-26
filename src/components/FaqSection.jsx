import React from 'react';

export default function FaqSection({ openFaq, toggleFaq }) {
    const sections = [
        {
            title: "About the food",
            items: [
                { id: 'f1', q: "What exactly is in Doglicious food?", a: "Real, human-grade ingredients — a minimum 80% fresh protein (chicken, lamb, or fish depending on recipe), whole organic vegetables (pumpkin, carrot, sweet potato, spinach), and small amounts of complex carbohydrates (brown rice, millets, quinoa). Zero artificial preservatives, colors, or fillers. Every ingredient is one you can read and recognise." },
                { id: 'f2', q: "Is the food AAFCO-aligned and vet approved?", a: "Yes. Every Doglicious recipe is AAFCO-aligned — meaning it meets complete and balanced nutritional standards for dogs. Our recipes are reviewed by certified veterinary nutritionists, and every batch is NABL lab certified. You get the lab report with your pack." },
                { id: 'f3', q: "How is it different from what I cook at home?", a: "Home cooking for dogs is wonderful in principle — but meeting complete nutritional standards is very hard to do consistently. Doglicious is developed with veterinary nutritionists to hit precise macronutrient and micronutrient targets for your dog's life stage, size and health needs. It's ghar ka khana, but built to a nutritional science standard." },
                { id: 'f4', q: "Can I mix it with my dog's current food?", a: "Yes — and we recommend it for transitions. Start with 25% Doglicious, 75% current food, and gradually shift over 7–10 days. This gives your dog's digestive system time to adjust and makes the transition smooth. Most dogs start preferring the fresh food within the first week." },
                { id: 'f5', q: "Are there any dogs who shouldn't eat Doglicious?", a: "Dogs on specific veterinary prescription diets for kidney disease, liver conditions, or other serious medical conditions should eat only as their vet directs. For all other healthy dogs — including puppies from 35 days, adults, and seniors — Doglicious is safe and beneficial. If your dog has specific allergies or sensitivities, let us know and we'll find the right recipe." }
            ]
        },
        {
            title: "Delivery & orders",
            items: [
                { id: 'f6', q: "Where do you deliver?", a: "We currently deliver across Gurgaon and selected areas of Delhi NCR. We're expanding regularly. WhatsApp us to check your specific pin code." },
                { id: 'f7', q: "How fresh is the food when it arrives?", a: "Cooked daily, delivered same day. From our kitchen to your dog's bowl in under 3 hours. No food sits overnight. No batches are prepared more than a day in advance. Your dog gets the freshest possible food — that's the entire point." },
                { id: 'f8', q: "Is delivery free?", a: "Yes. Free delivery across our entire service area — Gurgaon and Delhi NCR. No minimum order requirement, no delivery fee. Including for the ₹99 sample." },
                { id: 'f9', q: "What's the shelf life? How should I store it?", a: "Store in the refrigerator. Consume the same day of delivery. Warm gently before serving — room temperature or slightly warm food has better aroma and palatability, especially for senior dogs." },
                { id: 'f10', q: "What if my dog doesn't like it?", a: "We offer a 30-day money-back guarantee. If your dog genuinely doesn't take to the food, we'll refund you. No hassle. That said — in our experience, the rare cases of initial hesitation are about palatant withdrawal from kibble, not a dislike of fresh food. Give it the 15-minute method for a few meals before giving up." }
            ]
        },
        {
            title: "Subscription & pricing",
            items: [
                { id: 'f11', q: "Do I need to commit to a subscription?", a: "No minimum commitment, ever. Try the ₹99 sample first. If you want to continue, order daily, weekly, or set up a regular delivery — entirely on your terms. You can pause, change, or stop at any time." },
                { id: 'f12', q: "How much does it cost per day?", a: "₹149 per 100g is our starting rate. Our nutrition expert will call you, understand your dog's breed, age, weight, and health goals in detail. Once the food plan is fully customised, we'll let you know the exact price. Most medium-sized dogs (15–20kg) come in at ₹450–600/day — less than most people spend on their own lunch." },
                { id: 'f13', q: "What payment methods do you accept?", a: "UPI (GPay, PhonePe, Paytm), credit/debit card (Visa, Mastercard, RuPay), net banking, and cash on delivery. All payments are secure and encrypted." }
            ]
        }
    ];

    return (
        <section id="faq" style={{ background: "var(--cream)" }}>
            <div className="wrap">
                <div className="sh c rv">
                    <span className="lbl">FAQ</span>
                    <h2 className="title">Questions &amp; answers <span style={{ fontSize: "clamp(18px,2.5vw,28px)", fontWeight: "400", color: "var(--t3)" }}>(FAQs)</span></h2>
                    <p className="lead mt12">Everything you need to know before making the switch.</p>
                </div>
                <div style={{ maxWidth: "720px", margin: "0 auto" }} className="rv">
                    {sections.map((section, sidx) => (
                        <React.Fragment key={sidx}>
                            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--t3)", margin: sidx === 0 ? "0 0 20px" : "32px 0 20px" }}>{section.title}</div>
                            <div className="faq-grid">
                                {section.items.map(item => (
                                    <div className={`faq-item ${openFaq === item.id ? 'on' : ''}`} key={item.id}>
                                        <button className="faq-q" onClick={() => toggleFaq(item.id)}>
                                            {item.q}
                                            <span className="faq-arrow">{openFaq === item.id ? '−' : '+'}</span>
                                        </button>
                                        <div className="faq-a">
                                            <div className="faq-a-inner">{item.a}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}
