<script>
    const {children} = $props();

    import { goto } from '$app/navigation';

    const token = localStorage.getItem('token');
    if (token) {
        goto('/dashboard');
    }
</script>
<div class="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center p-4">
    {@render children()}
</div>