<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Update authenticated user's profile.
     * Supports partial updates. To change password, send `current_password`,
     * `password` and `password_confirmation`.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $rules = [
            'firstname' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'email' => ['sometimes', 'required', 'email', 'max:255', "unique:users,email,{$user->id}"],
            'contact_number' => ['sometimes', 'required', 'regex:/^0[0-9]{10}$/'],
            'gender' => ['sometimes', 'required', 'in:male,female'],
            'age' => ['sometimes', 'required', 'integer', 'min:1'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'birthdate' => ['sometimes', 'required', 'date'],
            'password' => ['sometimes', 'required_with:current_password,password_confirmation', 'string', 'min:6', 'confirmed'],
            'current_password' => ['sometimes', 'required_with:password,password_confirmation'],
            'password_confirmation' => ['sometimes', 'required_with:password,current_password'],
            'profile_image' => ['sometimes', 'file', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:2048'],
            'remove_profile_image' => ['sometimes', 'boolean'],
        ];

        // Validate including files
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('password')) {
            if (! Hash::check($request->input('current_password', ''), $user->password)) {
                return response()->json(['errors' => ['current_password' => ['Current password is incorrect.']]], 422);
            }
            $user->password = bcrypt($request->input('password'));
        }

        $allowed = [
            'firstname',
            'middlename',
            'lastname',
            'email',
            'contact_number',
            'gender',
            'age',
            'address',
            'birthdate',
        ];

        $updateData = $request->only($allowed);

        if (! empty($updateData)) {
            $user->fill($updateData);
        }

        // Handle explicit removal
        if ($request->boolean('remove_profile_image') && empty($request->file('profile_image'))) {
            if (! empty($user->profile_image_path)) {
                $oldPath = $user->profile_image_path;
                if (preg_match('#^https?://#i', $oldPath)) {
                    $parsedPath = parse_url($oldPath, PHP_URL_PATH) ?: '';
                    $oldPath = $parsedPath;
                }
                $oldPath = ltrim($oldPath, '/');
                $oldPath = preg_replace('#^storage/#i', '', $oldPath);
                if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $user->profile_image_path = null;
        }

        if ($request->hasFile('profile_image')) {
            if (! empty($user->profile_image_path)) {
                $oldPath = $user->profile_image_path;
                if (preg_match('#^https?://#i', $oldPath)) {
                    $parsedPath = parse_url($oldPath, PHP_URL_PATH) ?: '';
                    $oldPath = $parsedPath;
                }
                $oldPath = ltrim($oldPath, '/');
                $oldPath = preg_replace('#^storage/#i', '', $oldPath);
                if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $path = $request->file('profile_image')->store('profile_images', 'public');
            $user->profile_image_path = $path;
        }

        $user->save();

        $fresh = $user->fresh();
        $responseUser = [
            'id' => $fresh->id,
            'firstname' => $fresh->firstname,
            'middlename' => $fresh->middlename,
            'lastname' => $fresh->lastname,
            'email' => $fresh->email,
            'contact_number' => $fresh->contact_number,
            'gender' => $fresh->gender,
            'age' => $fresh->age,
            'birthdate' => $fresh->birthdate,
            'address' => $fresh->address,
            'roles' => $fresh->getRoleNames(),
            'profile_image_path' => $fresh->profile_image_path,
            'profile_image_url' => $fresh->profile_image_path ? asset(Storage::url($fresh->profile_image_path)) : null,
        ];

        return response()->json(['message' => 'Your profile is updated successfully', 'user' => $responseUser]);
    }

    public function show(Request $request)
    {
        $user = $request->user();

        $data = [
            'id' => $user->id,
            'firstname' => $user->firstname,
            'middlename' => $user->middlename,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'gender' => $user->gender,
            'age' => $user->age,
            'birthdate' => $user->birthdate,
            'address' => $user->address,
            'profile_image_path' => $user->profile_image_path,
            'profile_image_url' => $user->profile_image_path ? asset(Storage::url($user->profile_image_path)) : null,
            'roles' => $user->getRoleNames(),
        ];

        return response()->json(['user' => $data]);
    }
}