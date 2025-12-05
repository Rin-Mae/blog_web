<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $age = fake()->numberBetween(18, 80);
        $birthdate = now()
            ->subYears($age)
            ->subDays(fake()->numberBetween(0, 364))
            ->format('Y-m-d');

        $numericPhone = preg_replace('/\D+/', '', fake()->numerify('09#########'));

        return [
            'firstname' => fake()->firstName(),
            'middlename' => fake()->boolean(30) ? fake()->firstName() : null,
            'lastname' => fake()->lastName(),
            'age' => $age,
            'birthdate' => $birthdate,
            'address' => fake()->address(),
            'contact_number' => $numericPhone === '' ? 0 : (int) $numericPhone,
            'gender' => fake()->randomElement(['male', 'female']),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
