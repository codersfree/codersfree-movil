<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Only students who bought the course can watch its lessons and save progress.
     */
    public function learn(User $user, Course $course): bool
    {
        return $user->isEnrolledIn($course);
    }

    /**
     * Only the instructor who owns the course can edit it, its syllabus and publish it.
     * (The permission to enter the panel is checked by route.permission.)
     */
    public function manage(User $user, Course $course): bool
    {
        return $course->user_id === $user->id;
    }
}
