# Kylas CRM Custom Fields Setup Guide

Unlike HubSpot, **Kylas CRM does not provide a public API for automatically creating custom fields**. You must create these fields manually through the Kylas web interface.

## How to create a custom field in Kylas
1. Log in to your Kylas dashboard.
2. Navigate to **CRM Settings** > **Customization**.
3. Select the **Leads** module.
4. Click **Add New Field**.
5. Create the following fields with their respective internal names and types.

---

## Required Custom Fields for Doglicious

When creating these fields, make sure the **Internal Name** matches the `cf...` keys used in our API integration. Kylas usually auto-generates internal names like `cfScanCount` when you type "Scan Count". **Make sure the internal names match the ones below exactly**.

### Core Tracker Fields
| Label | Internal Name (API Key) | Field Type | Description |
|---|---|---|---|
| Scan Count | `cfScanCount` | Number | Tracks free vs paid scans |
| Paid Scans | `cfPaidScans` | Number | Tracks prepaid credits from PayU |
| Lead Status | `cfLeadStatus` | Dropdown | e.g. New, Chatting, Ordered, Follow Up, Converted |

### Dog Identity Fields
| Label | Internal Name (API Key) | Field Type | Description |
|---|---|---|---|
| Dog Name | `cfDogName` | Text | Name of the dog |
| Dog Breed | `cfDogBreed` | Text | Breed of the dog |
| Dog Age Years | `cfDogAgeYears` | Number | Age in years |
| Dog Weight KG | `cfDogWeightKg` | Text | e.g., 20kg |
| Notes | `cfNotes` | Text Area | Any known allergies or medications |

### VetRx Scan Diagnosis Fields
| Label | Internal Name (API Key) | Field Type | Description |
|---|---|---|---|
| Body Part | `cfBodyPart` | Text | Analyzed body part |
| Severity | `cfSeverity` | Text | e.g., Low, Medium, High |
| Diagnosis | `cfDiagnosis` | Text Area | The full VetRx diagnosis |
| Health Score | `cfHealthScore` | Number | AI-determined health score |
| Symptoms | `cfSymptoms` | Text Area | Selected symptoms |

### Diet & Food Fields
| Label | Internal Name (API Key) | Field Type | Description |
|---|---|---|---|
| Diet Advice | `cfDietAdvice` | Text Area | AI dietary recommendations |
| Current Food | `cfCurrentFood` | Text | User's current dog food brand |
| Food Grams | `cfFoodGrams` | Text | e.g., 200g |
| Food Times | `cfFoodTimes` | Text | e.g., 2 times a day |
