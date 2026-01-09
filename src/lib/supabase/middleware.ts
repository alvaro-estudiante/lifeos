import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not signed in and the current path is not /login or /register, redirect the user to /auth/login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth/login") &&
    !request.nextUrl.pathname.startsWith("/auth/register") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // Check if it's a static asset or API route, etc.
    // For simplicity, we assume root is protected but landing page logic might differ.
    // However, the requirement says "Proteger rutas del dashboard".
    // Let's assume everything except auth routes is protected for now, or at least root "/"
    
    // Better logic: if user is not logged in and tries to access dashboard routes
    // For now, let's protect everything.
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If user is signed in and the current path is /auth/login or /auth/register, redirect the user to /dashboard
  if (user && (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/register"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Check onboarding status
  if (user && !request.nextUrl.pathname.startsWith("/onboarding/setup")) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (!profile?.full_name) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/setup";
      return NextResponse.redirect(url);
    }
  }

  return response;
}