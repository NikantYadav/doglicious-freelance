import React from 'react';

export default function RecipesSection({ openModal }) {
    const recipes = [
        { e: "🍗", n: "Chicken & Pumpkin", d: "Gut-soothing pumpkin with lean chicken and brown rice. Perfect for sensitive tummies.", tag: "Bestseller" },
        { e: "🍖", n: "Tender Lamb in Gravy", d: "Slow-cooked lamb with organic carrots and millets. Rich, hearty, nutrient-dense.", tag: "Fan Favorite" },
        { e: "🫙", n: "Bone Broth Pour-Over", d: "Mineral-rich broth over chicken and sweet potato. Joint support in every bite.", tag: "Joint Health" },
        { e: "🥗", n: "Chicken Quinoa Bowl", d: "High-protein wellness bowl with farm chicken and seasonal greens. For active dogs.", tag: "High Energy" },
        { e: "🧀", n: "Paneer & Farm Feast", d: "Vegetarian delight with paneer, vegetables and brown rice. Calcium-rich.", tag: "Vegetarian" },
        { e: "🫀", n: "Healthy Liver Delite", d: "Chicken liver, pumpkin and millets. Naturally high in iron and Vitamin A.", tag: "Superfood" },
    ];

    return (
        <section id="recipes" className="recipes-bg">
            <div className="wrap">
                <div className="sh c rv">
                    <span className="lbl">Recipes</span>
                    <h2 className="title">Most loved recipes.</h2>
                    <p className="lead mt12">Unlimited vet-approved recipes — starting with our most-loved favourites.</p>
                </div>
                <div className="rg sg">
                    {recipes.map((r, i) => (
                        <div key={i} className="rc" onClick={() => openModal('sample')}>
                            <div className="re">{r.e}</div>
                            <h3>{r.n}</h3>
                            <p>{r.d}</p>
                            <span className="rtag">{r.tag}</span>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: "center", marginTop: "32px" }} className="rv">
                    <button className="btn btn-primary" onClick={() => openModal('sample')}>Try any recipe — ₹99</button>
                </div>
            </div>
        </section>
    );
}
