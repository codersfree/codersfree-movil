<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePushTokenRequest;
use App\Models\PushToken;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PushTokenController extends Controller
{
    /**
     * Save this phone's Expo Push token for the user (a phone has one token: it moves to the new user).
     */
    public function store(StorePushTokenRequest $request): Response
    {
        PushToken::updateOrCreate(
            ['token' => $request->validated('token')],
            ['user_id' => $request->user()->id],
        );

        return response()->noContent();
    }

    /**
     * Forget this phone's token (on logout).
     */
    public function destroy(Request $request): Response
    {
        $request->user()->pushTokens()->where('token', (string) $request->input('token'))->delete();

        return response()->noContent();
    }
}
