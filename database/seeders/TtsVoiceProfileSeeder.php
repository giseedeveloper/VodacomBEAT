<?php

namespace Database\Seeders;

use App\Models\PronunciationEntry;
use App\Models\TtsVoiceProfile;
use Illuminate\Database\Seeder;

class TtsVoiceProfileSeeder extends Seeder
{
    public function run(): void
    {
        $voices = [
            [
                'slug' => 'daudi-professional',
                'label' => 'Daudi — Male Professional',
                'provider' => 'azure',
                'model_id' => 'sw-TZ-DaudiNeural',
                'provider_voice_id' => 'sw-TZ-DaudiNeural',
                'gender' => 'male',
                'style' => 'professional',
                'speaking_rate' => -3,
                'pitch' => -2,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => true,
                'is_active' => true,
                'is_premium' => false,
                'license_note' => 'Azure Neural TTS sw-TZ — production male',
            ],
            [
                'slug' => 'daudi-calm',
                'label' => 'Daudi — Male Calm',
                'provider' => 'azure',
                'model_id' => 'sw-TZ-DaudiNeural',
                'provider_voice_id' => 'sw-TZ-DaudiNeural',
                'gender' => 'male',
                'style' => 'calm',
                'speaking_rate' => -8,
                'pitch' => -4,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => false,
                'is_active' => true,
                'is_premium' => false,
                'style_prompt' => 'Closest pacing to manual Chaz studio sample',
                'license_note' => 'Azure Neural TTS sw-TZ',
            ],
            [
                'slug' => 'daudi-energetic',
                'label' => 'Daudi — Male Energetic',
                'provider' => 'azure',
                'model_id' => 'sw-TZ-DaudiNeural',
                'provider_voice_id' => 'sw-TZ-DaudiNeural',
                'gender' => 'male',
                'style' => 'energetic',
                'speaking_rate' => 5,
                'pitch' => 1,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => false,
                'is_active' => true,
                'is_premium' => false,
                'license_note' => 'Azure Neural TTS sw-TZ',
            ],
            [
                'slug' => 'rehema-friendly',
                'label' => 'Rehema — Female Friendly',
                'provider' => 'azure',
                'model_id' => 'sw-TZ-RehemaNeural',
                'provider_voice_id' => 'sw-TZ-RehemaNeural',
                'gender' => 'female',
                'style' => 'friendly',
                'speaking_rate' => -1,
                'pitch' => 1,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => false,
                'is_active' => true,
                'is_premium' => false,
                'license_note' => 'Azure Neural TTS sw-TZ — production female',
            ],
            [
                'slug' => 'rehema-professional',
                'label' => 'Rehema — Female Professional',
                'provider' => 'azure',
                'model_id' => 'sw-TZ-RehemaNeural',
                'provider_voice_id' => 'sw-TZ-RehemaNeural',
                'gender' => 'female',
                'style' => 'professional',
                'speaking_rate' => -3,
                'pitch' => 0,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => false,
                'is_active' => true,
                'is_premium' => false,
                'license_note' => 'Azure Neural TTS sw-TZ',
            ],
            [
                'slug' => 'rehema-energetic',
                'label' => 'Rehema — Female Energetic',
                'provider' => 'azure',
                'model_id' => 'sw-TZ-RehemaNeural',
                'provider_voice_id' => 'sw-TZ-RehemaNeural',
                'gender' => 'female',
                'style' => 'energetic',
                'speaking_rate' => 4,
                'pitch' => 2,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => false,
                'is_active' => true,
                'is_premium' => false,
                'license_note' => 'Azure Neural TTS sw-TZ',
            ],
            [
                'slug' => 'mms-swh-fallback',
                'label' => 'Kiswahili MMS Fallback',
                'provider' => 'mms',
                'model_id' => 'facebook/mms-tts-swh',
                'provider_voice_id' => 'facebook/mms-tts-swh',
                'gender' => 'neutral',
                'style' => 'fallback',
                'speaking_rate' => 0,
                'pitch' => 0,
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => false,
                'is_active' => true,
                'is_premium' => false,
                'license_note' => 'CC-BY-NC — offline/dev fallback only',
            ],
        ];

        // Deactivate old MMS defaults if present
        TtsVoiceProfile::query()
            ->whereIn('slug', ['mms-swh-default', 'biztune-female-v1', 'biztune-male-v1'])
            ->update(['is_default' => false, 'is_active' => false]);

        foreach ($voices as $voice) {
            TtsVoiceProfile::query()->updateOrCreate(
                ['slug' => $voice['slug']],
                $voice
            );
        }

        $pronunciations = [
            ['original_text' => 'M-Pesa', 'replacement_text' => 'Em Pesa', 'scope' => 'GLOBAL'],
            ['original_text' => 'Mpesa', 'replacement_text' => 'Em Pesa', 'scope' => 'GLOBAL'],
            ['original_text' => 'Sumbawanga', 'replacement_text' => 'Su-mba-wa-nga', 'scope' => 'GLOBAL'],
            ['original_text' => 'Forowanga', 'replacement_text' => 'Fo-ro-wa-nga', 'scope' => 'GLOBAL'],
            ['original_text' => 'Huawei', 'replacement_text' => 'Hua-wei', 'scope' => 'GLOBAL'],
            ['original_text' => 'Tecno', 'replacement_text' => 'Tek-no', 'scope' => 'GLOBAL'],
            ['original_text' => 'Infinix', 'replacement_text' => 'In-fi-niks', 'scope' => 'GLOBAL'],
            ['original_text' => 'Miswala', 'replacement_text' => 'Mi-swa-la', 'scope' => 'GLOBAL'],
            ['original_text' => 'Majuba', 'replacement_text' => 'Ma-ju-ba', 'scope' => 'GLOBAL'],
            ['original_text' => 'Chaz', 'replacement_text' => 'Chaz', 'scope' => 'GLOBAL'],
        ];

        foreach ($pronunciations as $entry) {
            PronunciationEntry::query()->updateOrCreate(
                [
                    'original_text' => $entry['original_text'],
                    'scope' => $entry['scope'],
                    'subscription_id' => null,
                ],
                array_merge($entry, [
                    'language' => 'sw-TZ',
                    'is_active' => true,
                ])
            );
        }
    }
}
