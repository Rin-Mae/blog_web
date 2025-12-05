<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthenticateController extends Controller
{

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'age' => ['required', 'integer', 'min:1'],
            'birthdate' => ['required', 'date'],
            'address' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'regex:/^0[0-9]{10}$/'],
            'gender' => ['required', 'in:male,female'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors(),
                'status' => false,
            ], 422);
        }

        User::create([
            'firstname' => $request->firstname,
            'middlename' => $request->middlename,
            'lastname' => $request->lastname,
            'age' => $request->age,
            'birthdate' => $request->birthdate,
            'address' => $request->address,
            'contact_number' => $request->contact_number,
            'gender' => $request->gender,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        return response()->json([
            'message' => 'Registration successful. You may now log in.',
            'status' => true,
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }


        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user && $user->status === 'banned') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Your account has been suspended by the admin',
                'status' => false,
            ], 403);
        }

        if ($user && $user->status === 'deactivated') {
            $request->session()->regenerate();

            return response()->json([
                'user' => $user,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'account_status' => $user->status,
                'status' => true,
                'message' => 'Your account is deactivated',
            ]);
        }

        $request->session()->regenerate();

        $message = 'User logged in successfully';
        if ($user->hasRole('admin')) {
            $message = 'Admin logged in successfully';
        }

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'account_status' => $user->status,
            'status' => true,
            'message' => $message,
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $message = 'User logged out successfully';
        if ($user->hasRole('admin')) {
            $message = 'Admin logged out successfully';
        }
        return response()->json(['message' => $message]);
    }

    public function user(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'account_status' => $user->status,
        ]);
    }
}
