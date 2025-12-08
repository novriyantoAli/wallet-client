<script>
    /** @type {import('./$types').LayoutProps} */
    const { children } = $props();
</script>

<div class="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex flex-col">
    <!-- Header with right-aligned menu -->
    <header class="bg-gradient shadow-lg">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/dashboard" class="flex items-center hover:opacity-90 transition-opacity duration-200">
                <i class="fas fa-wallet text-white text-2xl mr-3"></i>
                <div class="text-white font-bold text-xl">Wallet CN</div>
            </a>
            <nav>
                <ul class="flex space-x-6">
                    <li>
                        <a href="/users/profile"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-user-circle mr-2"></i>
                            <span>Profile</span>
                        </a>
                    </li>
                    <li>
                        <a href="/users/logout"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-sign-out-alt mr-2"></i>
                            <span>Logout</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-8 flex-grow">

        {@render children()}

        <!-- Footer -->
        <div class="mt-10 mb-6 text-center text-gray-400 text-sm animate-fade-in">
            <p>© 2025 Contact Management. All rights reserved.</p>
        </div>
    </main>
</div>