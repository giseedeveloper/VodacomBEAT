<?php

namespace Database\Seeders;

use App\Models\ScriptTemplate;
use Illuminate\Database\Seeder;

class ScriptTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'template_key' => 'retail_store_visit_friendly_v1',
                'name' => 'Retail store visit — friendly (Forowanga pattern)',
                'category' => 'RETAIL_FASHION',
                'objective' => 'VISIT_STORE',
                'supported_tones' => ['FRIENDLY_SALES', 'ENERGETIC', 'LUXURY', 'RESPECTFUL'],
                'maximum_words' => 75,
                'target_duration_seconds' => 30,
                'required_fields' => ['businessName', 'productsOrServices', 'location', 'callToAction'],
                'optional_fields' => ['sellingPoint', 'secondaryProducts', 'landmark'],
                'opening_rules' => [
                    'Begin with a welcoming phrase',
                    'Mention the business name early',
                ],
                'body_rules' => [
                    'Prioritize the most important products (max 10 primary)',
                    'Do not list every item if the list is too long',
                    'Use "aina mbalimbali" instead of unsupported "aina zote"',
                    'Only use selling points the customer supplied',
                ],
                'cta_rules' => [
                    'Invite listeners to visit the business',
                    'Mention location or landmark',
                    'End with a short memorable call to action',
                ],
                'prohibited_claims' => [
                    'aina zote',
                    'bure',
                    'guaranteed',
                    'number one',
                    'cheapest',
                ],
                'prompt_instructions' => <<<'TXT'
Generate a Tanzanian Kiswahili caller-tune advertisement.

Follow this exact structure:
1. Welcome the listener and mention the business name.
2. Explain what the business sells or offers.
3. Mention only the most important products.
4. Mention customer-provided selling points only.
5. Optionally mention secondary products briefly.
6. Mention the location and landmark.
7. End with a short memorable call to action.
8. Optionally repeat the business name near the end.

Rules:
- Do not invent prices, offers, products or locations.
- Do not claim "best", "number one" or "cheapest" unless supplied.
- Prefer "aina mbalimbali" instead of unsupported claims like "aina zote".
- Keep sentences short and suitable for text-to-speech.
- Add natural punctuation for voice pauses.
- Use Tanzanian Kiswahili (sw-TZ).
- Target 55 to 75 words per variant.
- Preserve the correct spelling of the business name.
- If the product list is long, prioritize the most important products.
- Return three script versions: SHORT_DIRECT, FRIENDLY_PROMOTIONAL, PROFESSIONAL.
TXT,
                'priority' => 200,
            ],
            [
                'template_key' => 'general_business_v1',
                'name' => 'General business fallback',
                'category' => 'GENERAL_OTHER',
                'objective' => 'BRAND_AWARENESS',
                'supported_tones' => [
                    'FRIENDLY_SALES',
                    'PROFESSIONAL',
                    'ENERGETIC',
                    'CALM',
                    'LUXURY',
                    'YOUTHFUL',
                    'RESPECTFUL',
                ],
                'maximum_words' => 70,
                'target_duration_seconds' => 30,
                'required_fields' => ['businessName', 'callToAction'],
                'optional_fields' => ['productsOrServices', 'location', 'landmark', 'sellingPoint'],
                'opening_rules' => ['Welcome and mention business name'],
                'body_rules' => ['Describe the offer briefly without inventing facts'],
                'cta_rules' => ['End with customer CTA or a safe visit/call invitation'],
                'prohibited_claims' => ['bure', 'guaranteed', 'aina zote'],
                'prompt_instructions' => <<<'TXT'
Write a short Tanzanian Kiswahili caller-tune script.
Mention business name, key products/services if provided, location if provided, and CTA.
Do not invent facts. Keep under 70 words. Return three variants.
TXT,
                'priority' => 10,
            ],
            [
                'template_key' => 'food_visit_friendly_v1',
                'name' => 'Food & hospitality visit',
                'category' => 'FOOD_HOSPITALITY',
                'objective' => 'VISIT_STORE',
                'supported_tones' => ['FRIENDLY_SALES', 'ENERGETIC', 'YOUTHFUL'],
                'maximum_words' => 70,
                'target_duration_seconds' => 30,
                'required_fields' => ['businessName', 'productsOrServices', 'location'],
                'optional_fields' => ['sellingPoint', 'landmark', 'offer'],
                'opening_rules' => ['Warm welcome with business name'],
                'body_rules' => ['Highlight signature dishes/services only'],
                'cta_rules' => ['Invite visit today'],
                'prohibited_claims' => ['bure', 'guaranteed'],
                'prompt_instructions' => 'Food hospitality caller-tune in Kiswahili. Short TTS-friendly sentences. 3 variants.',
                'priority' => 150,
            ],
        ];

        foreach ($templates as $template) {
            ScriptTemplate::query()->updateOrCreate(
                ['template_key' => $template['template_key']],
                array_merge($template, [
                    'language' => 'sw-TZ',
                    'version' => 1,
                    'status' => 'ACTIVE',
                ])
            );
        }
    }
}
