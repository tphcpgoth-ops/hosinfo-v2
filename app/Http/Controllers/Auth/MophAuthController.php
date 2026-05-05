<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class MophAuthController extends Controller
{
    /**
     * Redirect the user to the MOPH ProviderID authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirect()
    {
        return Socialite::driver('moph')->redirect();
    }

    /**
     * Obtain the user information from MOPH ProviderID.
     *
     * @return \Illuminate\Http\Response
     */
    public function callback()
    {
        try {
            $mophUser = Socialite::driver('moph')->user();
        } catch (\Exception $e) {
            return redirect('/auth/login')->withErrors(['error' => 'การเข้าสู่ระบบด้วย MOPH ProviderID ล้มเหลว กรุณาลองใหม่อีกครั้ง']);
        }

        $rawUser = $mophUser->user;
        $mophId = $rawUser['moph_id'] ?? null;
        $pid = $rawUser['pid'] ?? null;

        // Find existing user by moph_id or pid
        $query = User::query();
        if ($mophId) {
            $query->where('moph_id', $mophId);
        }
        if ($pid) {
            $query->orWhere('pid', $pid);
        }
        
        $user = $query->first();

        if (!$user) {
            // Create a new user
            $user = User::create([
                'name' => $mophUser->getName(),
                'pid' => $pid,
                'moph_id' => $mophId,
                'role' => 'user', // default role
            ]);
        } else {
            // Update moph_id if they previously registered without it but PID matches
            if (!$user->moph_id && $mophId) {
                $user->update(['moph_id' => $mophId]);
            }
        }

        Auth::login($user);

        // Redirect to complete registration if department is not set
        if (!$user->department_id) {
            return redirect()->route('complete.registration');
        }

        return redirect()->intended('/');
    }
}
