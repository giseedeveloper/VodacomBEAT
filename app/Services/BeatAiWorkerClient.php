<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BeatAiWorkerClient
{

    public static function post(string $path, array $payload): array
    {
        $baseUrl = rtrim((string) Config::get('beat.ai_worker.base_url'), '/');
        $timeout = (int) Config::get('beat.ai_worker.timeout_seconds', 120);
        $token = (string) Config::get('beat.ai_worker.internal_token', '');

        $request = Http::timeout($timeout)->acceptJson();
        if ($token !== '') {
            $request = $request->withToken($token);
        }

        try {
            $response = $request->post("{$baseUrl}{$path}", $payload);
        } catch (\Exception $e) {
            Log::error('ai-worker request failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'AI worker is unavailable'];
        }

        if (! $response->successful()) {
            Log::error('ai-worker returned HTTP ' . $response->status() . ': ' . $response->body());
            return [
                'success' => false,
                'message' => $response->json('message') ?? 'AI worker returned an error',
            ];
        }

        return $response->json();
    }

    public static function get(string $path): array
    {
        $baseUrl = rtrim((string) Config::get('beat.ai_worker.base_url'), '/');
        $timeout = (int) Config::get('beat.ai_worker.timeout_seconds', 120);
        $token = (string) Config::get('beat.ai_worker.internal_token', '');

        $request = Http::timeout($timeout)->acceptJson();
        if ($token !== '') {
            $request = $request->withToken($token);
        }

        try {
            $response = $request->get("{$baseUrl}{$path}");
        } catch (\Exception $e) {
            Log::error('ai-worker GET failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'AI worker is unavailable'];
        }

        if (! $response->successful()) {
            return [
                'success' => false,
                'message' => $response->json('message') ?? 'AI worker returned an error',
            ];
        }

        return $response->json();
    }

}
