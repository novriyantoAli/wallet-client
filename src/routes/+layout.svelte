<script>
	import favicon from '$lib/assets/favicon.svg';
    import { onMount } from 'svelte';
	import '../app.css';
    import { userDetail } from '$lib/api/UserApi';
	import { authMe } from '$lib/api/AuthApi';

	let { children } = $props();

	onMount( async () => {
		const token = localStorage.getItem('token');
		const user = JSON.parse(localStorage.getItem('user'));
		if (!token || !user) {
			return;
		}

		try {
			const response = await authMe(token);

			if (response.status !== 200) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			} 
		} catch (error) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
