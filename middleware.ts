import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define all public routes
const isPublicRoute = createRouteMatcher([
  '/',               // Landing page
  '/sign-in(.*)',    // Sign-in route
  '/sign-up(.*)',
  '/api/webhook'    // Sign-up route
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect(); // Protect everything that's not public
  }
});

export const config = {
  matcher: [
    // Run middleware for everything except static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Run for API and trpc routes too
    '/(api|trpc)(.*)',
  ],
};
