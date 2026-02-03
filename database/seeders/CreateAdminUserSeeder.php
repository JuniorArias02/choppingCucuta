<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Rol::where('nombre', 'admin')->first();

        if ($adminRole) {
            User::create([
                'nombre' => 'Junior Arias',
                'email' => 'junior.arias02yt@gmail.com',
                'password' => Hash::make('admin123'),
                'rol_id' => $adminRole->id,
                'estado' => 'activo',
            ]);
        }
    }
}
