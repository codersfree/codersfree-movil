<?php

namespace App\Models;

use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['section_id', 'title', 'video_url', 'position'])]
class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Section, $this>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Students who marked this lesson as watched.
     *
     * @return BelongsToMany<User, $this>
     */
    public function completedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'lesson_user')->withTimestamps();
    }
}
