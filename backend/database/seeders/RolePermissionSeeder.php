<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view posts',
            'create posts',
            'edit posts',
            'delete posts',
            'publish posts',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Blogger role - can manage their own posts
        $bloggerRole = Role::create(['name' => 'blogger']);
        $bloggerRole->givePermissionTo([
            'view posts',
            'create posts',
            'edit posts',
        ]);

        // Admin role - has all permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
