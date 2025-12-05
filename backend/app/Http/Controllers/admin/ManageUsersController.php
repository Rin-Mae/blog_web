<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ManageUsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::with('roles:id,name')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('firstname', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->orderBy('id', 'asc')
            ->paginate(5);

        $users->through(fn($user) => [
            'id' => $user->id,
            'firstname' => $user->firstname,
            'middlename' => $user->middlename,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'profile_image_url' => $user->profile_image_url,
            'roles' => $user->roles->pluck('name'),
            'status' => $user->status,
            'created_at' => $user->created_at,
        ]);

        return response()->json($users);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        $data = [
            'id' => $user->id,
            'firstname' => $user->firstname,
            'middlename' => $user->middlename,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'profile_image_url' => $user->profile_image_url,
            'birthdate' => $user->birthdate,
            'address' => $user->address,
            'contact_number' => $user->contact_number,
            'gender' => $user->gender,
            'age' => $user->age,
            "roles" => $user->getRoleNames(),
            'status' => $user->status,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];

        return response()->json([
            'user' => $data,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        $data = [
            'id' => $user->id,
            'firstname' => $user->firstname,
            'middlename' => $user->middlename,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'gender' => $user->gender,
            'age' => $user->age,
            'address' => $user->address,
            'birthdate' => $user->birthdate,
            'profile_image_url' => $user->profile_image_url,
            'roles' => $user->getRoleNames(),
            'status' => $user->status,
        ];

        return response()->json([
            'user' => $data,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $input = $request->only([
            'firstname',
            'middlename',
            'lastname',
            'email',
            'contact_number',
            'gender',
            'age',
            'address',
            'birthdate'
        ]);

        $validator = Validator::make($input, [
            'firstname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'email' => ['required', 'email', 'max:255', "unique:users,email,{$id}"],
            'contact_number' => ['required', 'regex:/^0[0-9]{10}$/'],
            'gender' => ['required', 'in:male,female'],
            'age' => ['required', 'integer', 'min:1', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'birthdate' => ['required', 'date', 'before:today'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($input);

        $user->load('roles');

        $data = [
            'id' => $user->id,
            'firstname' => $user->firstname,
            'middlename' => $user->middlename,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'gender' => $user->gender,
            'age' => $user->age,
            'roles' => $user->getRoleNames(),
            'status' => $user->status,
            'updated_at' => $user->updated_at,
        ];

        return response()->json(['message' => 'User updated', 'user' => $data]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if (Auth::id() === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        if ($user->delete()) {
            return response()->json(['message' => 'User deleted successfully']);
        } else {
            return response()->json(['message' => 'Failed to delete user']);
        }
    }

    public function updateStatus(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:active,banned'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Cannot modify admin status.'], 403);
        }

        if ($user->status === 'deactivated') {
            return response()->json(['message' => 'User is deactivated; status cannot be modified.'], 422);
        }

        $newStatus = $request->input('status');
        if ($newStatus === $user->status) {
            return response()->json(['message' => 'Status unchanged', 'status' => $user->status]);
        }

        $user->status = $newStatus;
        $user->save();

        return response()->json(['message' => 'User status updated successfully', 'status' => $user->status]);
    }
}
