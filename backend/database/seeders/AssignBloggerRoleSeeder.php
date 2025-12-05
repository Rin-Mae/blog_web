<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AssignBloggerRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear Spatie cache so permission/role checks are fresh
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Ensure the 'blogger' role exists
        Role::firstOrCreate(['name' => 'blogger']);

        // If users table still has a `role` column, target rows where it's null/empty
        if (Schema::hasColumn('users', 'role')) {
            $users = User::whereNull('role')
                ->orWhere('role', '')
                ->orWhereRaw("TRIM(role) = ''")
                ->get();
        } else {
            // Otherwise target users who don't have any Spatie roles
            $users = User::doesntHave('roles')->get();
        }

        $count = 0;

        foreach ($users as $user) {
            if (! $user->hasRole('blogger')) {
                $user->assignRole('blogger');
                $count++;
            }
        }

        $this->command->info("Assigned 'blogger' role to {$count} users.");
    }
}
