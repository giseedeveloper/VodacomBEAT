<?php

namespace Database\Seeders;

use App\Models\TtsVoiceProfile;
use Illuminate\Database\Seeder;

class TtsVoiceProfileSeeder extends Seeder
{

    public function run(): void
    {
        $voices = [
            [
                'slug' => 'mms-swh-default',
                'label' => 'Kiswahili (MMS Default)',
                'provider' => 'mms',
                'model_id' => 'facebook/mms-tts-swh',
                'gender' => 'neutral',
                'language' => 'sw-TZ',
                'is_finetuned' => false,
                'is_default' => true,
                'is_active' => true,
                'license_note' => 'CC-BY-NC 4.0 — dev/staging until BizTune fine-tuned voices ship',
            ],
            [
                'slug' => 'biztune-female-v1',
                'label' => 'BizTune Female v1',
                'provider' => 'mms',
                'model_id' => 'local/biztune-female-v1',
                'gender' => 'female',
                'language' => 'sw-TZ',
                'is_finetuned' => true,
                'is_default' => false,
                'is_active' => false,
                'license_note' => 'Enable after checkpoint is deployed to /app/models',
            ],
            [
                'slug' => 'biztune-male-v1',
                'label' => 'BizTune Male v1',
                'provider' => 'mms',
                'model_id' => 'local/biztune-male-v1',
                'gender' => 'male',
                'language' => 'sw-TZ',
                'is_finetuned' => true,
                'is_default' => false,
                'is_active' => false,
                'license_note' => 'Enable after checkpoint is deployed to /app/models',
            ],
        ];

        foreach ($voices as $voice) {
            TtsVoiceProfile::query()->updateOrCreate(
                ['slug' => $voice['slug']],
                $voice
            );
        }
    }

}
