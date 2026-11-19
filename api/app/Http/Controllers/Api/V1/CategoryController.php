<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Categories that have at least one published course.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->whereHas('courses', fn ($query) => $query->published())
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }
}
