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
}
