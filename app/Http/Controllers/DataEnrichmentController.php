<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class DataEnrichmentController extends Controller
{
    /**
     * Display the HOSxP data enrichment tool.
     */
    public function index(): Response
    {
        $apiUrl = rtrim(env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800'), '/');

        return Inertia::render('tools/data-enrichment/index', [
            'externalApiUrl' => $apiUrl,
        ]);
    }

    /**
     * Proxy batch lookup request to HOSxP FastAPI backend.
     */
    public function lookup(Request $request)
    {
        // ขยายเวลา timeout สำหรับการค้นหาข้อมูลชุดใหญ่จากฐานข้อมูล HOSxP
        set_time_limit(180);

        $request->validate([
            'items' => 'required|array|max:1000',
            'items.*.hn' => 'required',
            'auto_pad_hn' => 'nullable|boolean',
            'hn_length' => 'nullable|integer|min:1|max:20',
            'fallback_to_latest_if_date_not_found' => 'nullable|boolean',
        ]);

        $apiUrl = rtrim(env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800'), '/');

        try {
            $response = Http::timeout(60)->post("{$apiUrl}/api/v1/enrichment/batch-lookup", [
                'items' => $request->input('items'),
                'auto_pad_hn' => $request->input('auto_pad_hn', true),
                'hn_length' => $request->input('hn_length', 9),
                'fallback_to_latest_if_date_not_found' => $request->input('fallback_to_latest_if_date_not_found', false),
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'API Backend error: ' . $response->body(),
            ], $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'ไม่สามารถเชื่อมต่อกับ HOSxP API ได้: ' . $e->getMessage(),
            ], 500);
        }
    }
}
