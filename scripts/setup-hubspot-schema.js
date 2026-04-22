import dotenv from 'dotenv';
dotenv.config({ path: '.env.backend' });

const properties = [
    { name: 'scan_count', label: 'Scan Count', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'dog_name', label: 'Dog Name', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'dog_breed', label: 'Dog Breed', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'dog_age_years', label: 'Dog Age Years', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'dog_weight_kg', label: 'Dog Weight KG', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'body_part', label: 'Body Part', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'severity', label: 'Severity', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'diagnosis', label: 'Diagnosis', type: 'string', fieldType: 'textarea', groupName: 'contactinformation' },
    { name: 'health_score', label: 'Health Score', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { name: 'diet_advice', label: 'Diet Advice', type: 'string', fieldType: 'textarea', groupName: 'contactinformation' },
    { name: 'symptoms', label: 'Symptoms', type: 'string', fieldType: 'textarea', groupName: 'contactinformation' },
    { name: 'current_food', label: 'Current Food', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'food_grams', label: 'Food Grams', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { name: 'food_times', label: 'Food Times', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    {
        name: 'lead_status', label: 'Lead Status (Custom)', type: 'enumeration', fieldType: 'select', groupName: 'contactinformation',
        options: [
            { label: 'New', value: 'new', hidden: false },
            { label: 'Chatting', value: 'chatting', hidden: false },
            { label: 'Ordered', value: 'ordered', hidden: false },
            { label: 'Follow Up', value: 'followup', hidden: false },
            { label: 'Converted', value: 'converted', hidden: false },
            { label: 'Lost', value: 'lost', hidden: false }
        ]
    }
];

async function setupProperties() {
    const HS_KEY = process.env.HUBSPOT_API_KEY;
    if (!HS_KEY) {
        console.error('❌ Could not find HUBSPOT_API_KEY in .env');
        process.exit(1);
    }

    console.log(`\n⚙️  Syncing schema with HubSpot...`);

    for (const prop of properties) {
        try {
            const res = await fetch(`https://api.hubapi.com/crm/v3/properties/contacts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HS_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prop)
            });

            const data = await res.json();

            if (res.ok) {
                console.log(`✅ Created property: ${prop.name}`);
            } else if (res.status === 409) {
                console.log(`⏩ Skipped (already exists): ${prop.name}`);
            } else {
                console.error(`❌ Failed to create ${prop.name}: ${data.message || JSON.stringify(data)}`);
            }
        } catch (err) {
            console.error(`❌ Network error for ${prop.name}:`, err.message);
        }
    }

    console.log('\n🎉 Schema sync complete!\n');
}

setupProperties();
