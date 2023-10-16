<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasPermissions;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable, HasRoles, HasPermissions;

    protected $appends = ['assigned_permissions'];

    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function getAssignedPermissionsAttribute()
    {
        return self::formatPermissions($this->permissions()->get());
    }

    public static function formatPermissions($permissions)
    {
        foreach ($permissions as $permission) {
            $namesArray = explode(":", $permission->name);
            $permission->description = ucwords($namesArray[1]) . " " . ucwords($namesArray[0]);

            # hide unrequired info
            unset($permission->id);
            unset($permission->pivot);
            unset($permission->guard_name);
            unset($permission->created_at);
            unset($permission->updated_at);

        }

        return $permissions;
    }

}
