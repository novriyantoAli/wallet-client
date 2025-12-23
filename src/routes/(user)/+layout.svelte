<script>
    /** @type {import('./$types').LayoutProps} */
    const { children } = $props();

    import { goto } from '$app/navigation';

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
        throw goto('/glogin');
    }

    const isClient = user?.level?.toLowerCase() === 'reseller' || user?.level?.toLowerCase() === 'admin';
</script>

<div class="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex flex-col">
    <!-- Header with right-aligned menu - Hidden on mobile -->
    <header class="bg-gradient shadow-lg hidden md:block">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/dashboard" class="flex items-center hover:opacity-90 transition-opacity duration-200">
                <i class="fas fa-wallet text-white text-2xl mr-3"></i>
                <div class="text-white font-bold text-xl">Wallet CN</div>
            </a>
            <nav>
                <ul class="flex space-x-6">
                    <li>
                        <a href="/dashboard"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-home mr-2"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="/purchases"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-receipt mr-2"></i>
                            <span>Purchases</span>
                        </a>
                    </li>
                    {#if isClient}
                    <li>
                        <a href="/transfer"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-exchange-alt mr-2"></i>
                            <span>Transfer</span>
                        </a>
                    </li>
                    <li>
                        <a href="/transfers"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-history mr-2"></i>
                            <span>Transfers</span>
                        </a>
                    </li>
                    {/if}
                    <li>
                        <a href="/users/profile"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-user-circle mr-2"></i>
                            <span>Profile</span>
                        </a>
                    </li>
                    <li>
                        <a href="/users/setup-pin"
                           class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                            <i class="fas fa-shield-alt mr-2"></i>
                            <span>Security PIN</span>
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

    <!-- Mobile Header - Logo only -->
    <header class="bg-gradient shadow-lg md:hidden">
        <div class="px-4 py-4 flex items-center">
            <a href="/dashboard" class="flex items-center hover:opacity-90 transition-opacity duration-200">
                <i class="fas fa-wallet text-white text-2xl mr-3"></i>
                <div class="text-white font-bold text-xl">Wallet CN</div>
            </a>
        </div>
    </header>

    <!-- Main content - Add padding for bottom nav on mobile -->
    <main class="container mx-auto px-4 py-8 flex-grow mb-20 md:mb-0">

        {@render children()}

        <!-- Footer -->
        <div class="mt-10 mb-6 text-center text-gray-400 text-sm animate-fade-in">
            <p>© 2025 Contact Management. All rights reserved.</p>
        </div>
    </main>

    <!-- Bottom Navigation Bar - Mobile Only -->
    <nav class="fixed bottom-0 left-0 right-0 bg-gradient shadow-lg md:hidden">
        <div class="flex justify-around items-center px-2">
            <a href="/dashboard"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-home text-xl mb-1"></i>
                <span class="text-xs">Dashboard</span>
            </a>
            <a href="/purchases"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-receipt text-xl mb-1"></i>
                <span class="text-xs">Purchases</span>
            </a>
            {#if isClient}
            <a href="/transfer"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-exchange-alt text-xl mb-1"></i>
                <span class="text-xs">Transfer</span>
            </a>
            <a href="/transfers"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-history text-xl mb-1"></i>
                <span class="text-xs">Transfers</span>
            </a>
            {/if}
            <a href="/users/profile"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-user-circle text-xl mb-1"></i>
                <span class="text-xs">Profile</span>
            </a>
            <a href="/users/setup-pin"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-shield-alt text-xl mb-1"></i>
                <span class="text-xs">Security PIN</span>
            </a>
            <a href="/users/logout"
               class="flex-1 flex flex-col items-center py-3 text-gray-100 hover:text-white transition-colors duration-200">
                <i class="fas fa-sign-out-alt text-xl mb-1"></i>
                <span class="text-xs">Logout</span>
            </a>
        </div>
    </nav>
</div>