export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth();

  const requiresAuth = to.meta.requiresAuth;
  const guestOnly = to.meta.guestOnly;

  // 1. Initial Fetch Logic
  // Only fetch if we are heading to a restricted route and don't have a user yet
  if ((requiresAuth || guestOnly) && !isAuthenticated.value) {
    try {
      if (import.meta.server) {
        const headers = useRequestHeaders(["cookie"]);
        await fetchUser(headers);
      } else {
        await fetchUser();
      }
    } catch (error) {
      // If fetch fails, ensure isAuthenticated is false
      console.error("Auth middleware fetch error:", error);
    }
  }

  // 2. Protection Logic
  if (requiresAuth && !isAuthenticated.value) {
    return navigateTo(`/login?redirectTo=${encodeURIComponent(to.fullPath)}`, {
      replace: true,
    });
  }

  // 3. Guest Logic (e.g., prevent logged-in users from seeing /login)
  if (guestOnly && isAuthenticated.value) {
    return navigateTo("/apps/dashboard", { replace: true });
  }
});