<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;

class ScriptValidationService
{
    public static function countWords(string $text): int
    {
        $parts = preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        return is_array($parts) ? count($parts) : 0;
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{valid: bool, word_count: int, problems: array<int, string>}
     */
    public static function validateGeneratedScript(array $input): array
    {
        $script = (string) ($input['script'] ?? '');
        $businessName = (string) ($input['business_name'] ?? '');
        $location = isset($input['location']) ? (string) $input['location'] : null;
        $maximumWords = (int) ($input['maximum_words'] ?? Config::get('beat.script.maximum_words', 75));
        $prohibitedTerms = $input['prohibited_terms'] ?? Config::get('beat.script.forbidden_claims', []);
        $mustInclude = $input['must_include_words'] ?? [];
        $mustExclude = $input['must_exclude_words'] ?? [];

        $problems = [];
        $normalized = mb_strtolower($script);
        $wordCount = self::countWords($script);

        if ($wordCount === 0) {
            $problems[] = 'Script text is empty.';
        }

        if ($wordCount > $maximumWords) {
            $problems[] = "Script exceeds {$maximumWords} words ({$wordCount}).";
        }

        if ($businessName !== '' && ! str_contains($normalized, mb_strtolower($businessName))) {
            $problems[] = 'Business name is missing.';
        }

        if ($location && $location !== '' && ! str_contains($normalized, mb_strtolower($location))) {
            // Soft check: location phrases may be paraphrased — warn only if no shared token.
            $tokens = preg_split('/[\s,]+/u', mb_strtolower($location), -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $matched = false;
            foreach ($tokens as $token) {
                if (mb_strlen($token) >= 4 && str_contains($normalized, $token)) {
                    $matched = true;
                    break;
                }
            }
            if (! $matched) {
                $problems[] = 'Location appears to be missing.';
            }
        }

        foreach ((array) $prohibitedTerms as $term) {
            $term = (string) $term;
            if ($term !== '' && str_contains($normalized, mb_strtolower($term))) {
                $problems[] = "Prohibited expression detected: {$term}";
            }
        }

        foreach ((array) $mustInclude as $word) {
            $word = (string) $word;
            if ($word !== '' && ! str_contains($normalized, mb_strtolower($word))) {
                $problems[] = "Required word missing: {$word}";
            }
        }

        foreach ((array) $mustExclude as $word) {
            $word = (string) $word;
            if ($word !== '' && str_contains($normalized, mb_strtolower($word))) {
                $problems[] = "Excluded word present: {$word}";
            }
        }

        if (preg_match('/\b\d{10,}\b/', $script)) {
            $problems[] = 'Unapproved phone numbers are not allowed in the script.';
        }

        return [
            'valid' => $problems === [],
            'word_count' => $wordCount,
            'problems' => $problems,
        ];
    }
}
