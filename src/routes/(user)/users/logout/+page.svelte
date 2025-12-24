<script>
    import { goto } from "$app/navigation";
    import { alertError } from "$lib/alert";
    import { authSignOut } from "$lib/api/AuthApi";
    import { userLogout } from "$lib/api/UserApi";
    import { onMount } from "svelte";

    async function handleLogout() {
        const token = localStorage.getItem('token');

        if (token) {
            const response = await authSignOut(token);
            const responseBody = await response.json();

            console.log(responseBody);

            if (response.status === 200) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                await alertError(responseBody.error);
            }
        } 

        await goto('/glogin');
    }

    onMount(async () => {
        await handleLogout();
    });
</script>