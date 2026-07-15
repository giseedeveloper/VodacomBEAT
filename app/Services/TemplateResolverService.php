<?php

namespace App\Services;

use App\Models\ScriptTemplate;
use Illuminate\Support\Facades\Config;

class TemplateResolverService
{
    /**
     * Backend owns template selection. Ignore Gemini's recommended key unless it matches.
     */
    public static function resolve(string $category, string $objective, string $tone, ?string $recommendedKey = null): ScriptTemplate
    {
        $allowedCategories = Config::get('beat.taxonomies.categories', []);
        $allowedObjectives = Config::get('beat.taxonomies.objectives', []);
        $allowedTones = Config::get('beat.taxonomies.tones', []);

        if (! in_array($category, $allowedCategories, true)) {
            $category = 'GENERAL_OTHER';
        }
        if (! in_array($objective, $allowedObjectives, true)) {
            $objective = 'BRAND_AWARENESS';
        }
        if (! in_array($tone, $allowedTones, true)) {
            $tone = 'FRIENDLY_SALES';
        }

        if ($recommendedKey) {
            $byKey = ScriptTemplate::query()
                ->where('template_key', $recommendedKey)
                ->where('status', 'ACTIVE')
                ->first();
            if ($byKey && $byKey->category === $category && $byKey->objective === $objective) {
                $tones = $byKey->supported_tones ?? [];
                if (in_array($tone, $tones, true) || empty($tones)) {
                    return $byKey;
                }
            }
        }

        $match = ScriptTemplate::query()
            ->where('status', 'ACTIVE')
            ->where('category', $category)
            ->where('objective', $objective)
            ->orderByDesc('priority')
            ->get()
            ->first(function (ScriptTemplate $template) use ($tone) {
                $tones = $template->supported_tones ?? [];
                return empty($tones) || in_array($tone, $tones, true);
            });

        if ($match) {
            return $match;
        }

        $categoryFallback = ScriptTemplate::query()
            ->where('status', 'ACTIVE')
            ->where('category', $category)
            ->orderByDesc('priority')
            ->first();

        if ($categoryFallback) {
            return $categoryFallback;
        }

        return ScriptTemplate::query()
            ->where('template_key', 'general_business_v1')
            ->where('status', 'ACTIVE')
            ->firstOrFail();
    }
}
