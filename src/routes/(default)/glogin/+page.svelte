<script>
    import { goto } from "$app/navigation";
    import { alertError, alertSuccess } from "$lib/alert.js";
    import { authSignIn, authAction } from "$lib/api/AuthApi";
    import { onMount } from "svelte";

    let loading = $state(false);

    onMount(() => {
        // Check if returning from Google OAuth callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (code) {
            // Successfully authenticated
            handleAuthSuccess(code, state);
        } else if (error) {
            // Authentication failed
            alertError(decodeURIComponent(error));
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    async function handleAuthSuccess(code, state) {
        try {
            // /oauth/authenticate [post]
            loading = true;

            const response = await authAction({
                provider: 'google',
                code: code,
                state: state,
            });

            const responseBody = await response.json();

            if (response.status === 200) {
                // harusnya nilai balik adalah user data
                const data = responseBody.data;

                console.log(data);

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user_info));

                // await alertSuccess('Login successful!');
                await goto('/dashboard');
            } else {
                throw new Error(responseBody.error || 'Failed to fetch user data');
            }
        } catch (error) {
            await alertError(error.message);
            // Redirect back to glogin on error
            await goto('/glogin');
        } finally {
            loading = false;
        }
    }

    async function handleGoogleLogin() {

        loading = true;

        // request to get url
        try {

            const response = await authSignIn({
                provider: 'google',
                redirect_uri: `${window.location.origin}/glogin`
            });

            const responseBody = await response.json();

            if (response.status !== 200) {
                throw new Error(responseBody.error);
            } else{
                window.location = responseBody.authorization_url;
            }
        } catch (error) {
            await alertError('Failed to initiate Google login. Please try again.');
        }
        // loading = true;
        // // Redirect to Google OAuth endpoint
        // const redirectUri = `${window.location.origin}/glogin`;
        // window.location.href = `${import.meta.env.VITE_URL_API}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
</script>

<div class="animate-fade-in bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-custom border border-gray-700 backdrop-blur-sm w-full max-w-md">
    <div class="text-center mb-8">
        <div class="inline-block p-3 bg-gradient rounded-full mb-4">
            <i class="fas fa-wallet text-3xl text-white"></i>
        </div>
        <h1 class="text-3xl font-bold text-white">Wallet CN</h1>
        <p class="text-gray-300 mt-2">Sign up or sign in with Google</p>
    </div>

    <div class="space-y-4">
        <!-- Google Sign-In Button -->
        <button 
            onclick={handleGoogleLogin}
            disabled={loading}
            class="w-full bg-white hover:bg-gray-100 disabled:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg transition-all duration-200 font-medium text-center flex items-center justify-center gap-2">
            {#if loading}
                <div class="animate-spin">
                    <i class="fas fa-spinner text-gray-800"></i>
                </div>
                <span>Redirecting...</span>
            {:else}
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
            {/if}
        </button>
    </div>

    <div class="mt-8 text-center text-xs text-gray-400 space-y-2">
        <p>By signing in, you agree to our Terms of Service</p>
        <p>and Privacy Policy</p>
    </div>
</div>

<style>
    :global(#google-signin-button > div) {
        margin: 0 auto;
    }
</style>