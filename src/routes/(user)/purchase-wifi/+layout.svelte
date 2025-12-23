<script>
    import { goto } from '$app/navigation';
    import { userSecurityCheck } from '$lib/api/UserApi';
    import { onMount } from 'svelte';

    /** @type {import('./$types').LayoutProps} */
    let { data, children } = $props();

    onMount( async() => {
        console.log('dipanggil');
        
            const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
        const response = await userSecurityCheck(token, user.id);
        if (response.status === 204) {
            throw goto('/users/setup-pin');
        } else if (response.status === 200) {
            return {};
        }
    }

    throw goto('/dashboard');
    });
</script>

{@render children()}