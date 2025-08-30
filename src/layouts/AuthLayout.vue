<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-darkest">
    <div class="w-full max-w-md bg-neutral-dark p-8 rounded-2xl shadow-lg">
      <div class="flex justify-center mb-6">
        <h1 class="text-primary text-2xl font-bold">Savure Express</h1>
      </div>

      <router-view />

      <p class="text-neutral-light text-sm text-center mt-6">
        © 2025 Savure Express. All rights reserved.
      </p>
    </div>
  </div>
</template>
