<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $slug
 * @property string $label
 * @property string $provider
 * @property string $model_id
 * @property string $gender
 * @property string $language
 * @property bool $is_finetuned
 * @property bool $is_default
 * @property bool $is_active
 * @property string|null $license_note
 */
class TtsVoiceProfile extends Model
{

    protected $casts = [
        'is_finetuned' => 'boolean',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $fillable = [
        'slug',
        'label',
        'provider',
        'model_id',
        'gender',
        'language',
        'is_finetuned',
        'is_default',
        'is_active',
        'license_note',
    ];

}
