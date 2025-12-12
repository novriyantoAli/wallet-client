<script>
    import { goto } from "$app/navigation";
    import { alertError } from "$lib/alert";
    import { userLogout } from "$lib/api/UserApi";
    import { onMount } from "svelte";

    async function handleLogout() {
        const token = localStorage.getItem('token');

        if (token) {
            const response = await userLogout(token);
            const responseBody = await response.json();

            console.log(responseBody);

            if (response.status === 200) {
                localStorage.removeItem('token');
            } else {
                await alertError(responseBody.error);
            }
        } 

        await goto('/login');
    }

    onMount(async () => {
        await handleLogout();
    });
</script>