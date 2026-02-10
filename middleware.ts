import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  const isAuthLoginOrSignup = request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/signup'
  const isOrganizerRoute = request.nextUrl.pathname.startsWith('/organizer')
  const isUmpireRoute = request.nextUrl.pathname.startsWith('/umpire')

  // If user is not authenticated and trying to access protected routes
  if (!session && (isOrganizerRoute || isUmpireRoute)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/signup pages, redirect based on role
  if (session && isAuthLoginOrSignup) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Middleware: Error fetching profile:', profileError)
    }

    const redirectUrl = request.nextUrl.clone()
    if (profile?.role === 'organizer') {
      console.log('Middleware: Redirecting organizer to dashboard')
      redirectUrl.pathname = '/organizer/dashboard'
    } else if (profile?.role === 'umpire') {
      console.log('Middleware: Redirecting umpire to matches')
      redirectUrl.pathname = '/umpire/matches'
    } else {
      console.log('Middleware: Redirecting to spectator dashboard, role:', profile?.role)
      redirectUrl.pathname = '/spectator/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Check role-based access for protected routes
  if (session && (isOrganizerRoute || isUmpireRoute)) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      // If profile doesn't exist, redirect to login
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has the correct role
    if (isOrganizerRoute && profile.role !== 'organizer') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/spectator/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // Organizers can access umpire routes (they're admins)
    if (isUmpireRoute && profile.role !== 'umpire' && profile.role !== 'organizer') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/spectator/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
