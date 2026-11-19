<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateProfilePhotoRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Storage;

class ProfilePhotoController extends Controller
{
    /**
     * Store the authenticated user's profile photo, replacing the previous one.
     */
    public function __invoke(UpdateProfilePhotoRequest $request): UserResource
    {
        $user = $request->user();
        $previousPath = $user->photo_path;

        $user->update([
            'photo_path' => $request->file('photo')->store('profile-photos', 'public'),
        ]);

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }

        return new UserResource($user);
    }
}
