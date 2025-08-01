'use client';

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from 'convex/react';
import {
    ArrowRight,
    Award,
    Calendar,
    Heart,
    MessageSquare,
    Shield,
    Star,
    Target,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-papaya_whip-500">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-prussian_blue-200/20 bg-papaya_whip-500/95 backdrop-blur supports-[backdrop-filter]:bg-papaya_whip-500/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-fire_brick-500 text-papaya_whip-500 font-bold">
              M
            </div>
            <span className="font-bold text-xl text-prussian_blue-500">MVT</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-fire_brick-500 text-prussian_blue-400">
              Features
            </Link>
            <Link href="#testimonials" className="transition-colors hover:text-fire_brick-500 text-prussian_blue-400">
              Testimonials
            </Link>
            <Link href="#about" className="transition-colors hover:text-fire_brick-500 text-prussian_blue-400">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Unauthenticated>
              <SignInButton>
                <Button variant="ghost" className="text-prussian_blue-500 hover:text-fire_brick-500 hover:bg-fire_brick-50">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500">
                  Get Started
                </Button>
              </SignUpButton>
            </Unauthenticated>
            <Authenticated>
              <Button className="bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </Authenticated>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-prussian_blue-500 sm:text-6xl font-editorial-italic">
              Your trusted Mentorship Platform for Veterans
              <br />
              <br />
              <span className="text-fire_brick-500 text-7xl font-editorial italic font-bold">No one left behind</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-prussian_blue-400 max-w-2xl mx-auto">
              Connect with fellow veterans who understand your journey. Get guidance, share experiences,
              and build lasting relationships that help you thrive in civilian life.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button variant="outline" size="lg" className="border-prussian_blue-300 text-prussian_blue-500 hover:bg-prussian_blue-50" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-prussian_blue-500">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-fire_brick-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-papaya_whip-500">2,500+</div>
              <div className="text-sm text-air_superiority_blue-400">Veterans Served</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-fire_brick-400">
                <Award className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-papaya_whip-500">500+</div>
              <div className="text-sm text-air_superiority_blue-400">Expert Mentors</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-fire_brick-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-papaya_whip-500">15,000+</div><div className="text-sm text-air_superiority_blue-400">Missions Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-fire_brick-400">
                <Star className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-papaya_whip-500">4.9/5</div>
              <div className="text-sm text-air_superiority_blue-400">Mission Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-papaya_whip-600">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-prussian_blue-500">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-prussian_blue-400">
              Our platform provides comprehensive tools and resources to support your career transition mission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire_brick-100 text-fire_brick-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-prussian_blue-500">Veteran Mentors</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-prussian_blue-400">
                  Connect with battle-tested veterans who've successfully completed their civilian career transition.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire_brick-100 text-fire_brick-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-prussian_blue-400">Mission Scheduling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-prussian_blue-400">
                  Book mentorship sessions that fit your operational schedule with our tactical calendar system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire_brick-100 text-fire_brick-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-prussian_blue-500">Verified Service</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-prussian_blue-400">
                  All mentors are verified veterans with proven track records and security clearances in their fields.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire_brick-100 text-fire_brick-600">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-prussian_blue-500">Precision Matching</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-prussian_blue-400">
                  Get matched with mentors based on your career objectives, MOS, and military background.
                </CardDescription> </CardContent> </Card> <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200"> <CardHeader> <div className="flex items-center space-x-3"> <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire_brick-100 text-fire_brick-600"> <MessageSquare className="h-6 w-6" /> </div> <CardTitle className="text-xl text-prussian_blue-500">Secure Communications</CardTitle> </div> </CardHeader> <CardContent> <CardDescription className="text-base text-prussian_blue-400"> Stay connected with encrypted messaging and secure video call capabilities. </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire_brick-100 text-fire_brick-600">
                    <Star className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-prussian_blue-500">After Action Reviews</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-prussian_blue-400">
                  Rate and review sessions to maintain high-quality mentorship and continuous improvement.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-air_superiority_blue-100">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-papaya_whip-500">
              Mission Success Stories
            </h2>
            <p className="mt-4 text-lg text-papaya_whip-500">
              Hear from veterans who've successfully completed their career transition missions with MVT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="border-2 border-fire_brick-200">
                    <AvatarFallback className="bg-fire_brick-100 text-fire_brick-600">SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-prussian_blue-500">Sarah Johnson</CardTitle>
                    <CardDescription className="text-prussian_blue-400">Software Engineer at Google</CardDescription>
                    <Badge variant="outline" className="mt-1 text-xs border-fire_brick-300 text-fire_brick-600">
                      Army Veteran
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-fire_brick-400 text-fire_brick-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-prussian_blue-400">
                  "MVT helped me execute a successful transition from military logistics to tech. My mentor provided tactical guidance through coding bootcamps and interview prep. Mission accomplished!"
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="border-2 border-fire_brick-200">
                    <AvatarFallback className="bg-fire_brick-100 text-fire_brick-600">MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-prussian_blue-500">Mike Chen</CardTitle>
                    <CardDescription className="text-prussian_blue-400">Product Manager at Microsoft</CardDescription>
                    <Badge variant="outline" className="mt-1 text-xs border-fire_brick-300 text-fire_brick-600">
                      Navy Veteran
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-fire_brick-400 text-fire_brick-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-prussian_blue-400">
                  "The strategic guidance I received was invaluable. My mentor helped me understand corporate operations and secure my first PM position. Outstanding support!"
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="border-2 border-fire_brick-200">
                    <AvatarFallback className="bg-fire_brick-100 text-fire_brick-600">ED</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-prussian_blue-500">Emily Davis</CardTitle>
                    <CardDescription className="text-prussian_blue-400">Entrepreneur & Startup Founder</CardDescription>
                    <Badge variant="outline" className="mt-1 text-xs border-fire_brick-300 text-fire_brick-600">
                      Air Force Veteran
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-fire_brick-400 text-fire_brick-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-prussian_blue-400">
                  "Starting a business felt like a complex operation, but my mentor's experience and network provided the intel I needed. MVT delivers results!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-papaya_whip-500">
        <div className="container px-4 mx-auto max-w-7xl">
          <Card className="mx-auto max-w-4xl bg-gradient-to-r from-fire_brick-500 to-fire_brick-600 text-papaya_whip-500 border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to Execute Your Career Mission?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of veterans who've successfully transitioned to fulfilling civilian careers.
                Your mentor is standing by to help you complete your mission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 bg-papaya_whip-500 text-fire_brick-600 hover:bg-papaya_whip-400 shadow-lg hover:shadow-xl transition-all duration-200" asChild>
                  <Link href="/dashboard">
                    Begin Mission
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" className="text-lg px-8 bg-papaya_whip-500 text-fire_brick-600 hover:bg-papaya_whip-400 shadow-lg hover:shadow-xl transition-all duration-200" asChild>
                  <Link href="/search">
                    Browse Mentors
                    <Users className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-prussian_blue-200 bg-prussian_blue-500">
        <div className="container px-4 py-12 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-fire_brick-500 text-papaya_whip-500 font-bold">
                  M
                </div>
                <span className="font-bold text-xl text-papaya_whip-500">MVT</span>
              </div>
              <p className="text-sm text-air_superiority_blue-300">
                Empowering veterans to achieve their career objectives through mentorship and brotherhood support.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-papaya_whip-500">Platform</h3>
              <ul className="space-y-2 text-sm text-air_superiority_blue-300">
                <li><Link href="/search" className="hover:text-papaya_whip-500 transition-colors">Find Mentors</Link></li>
                <li><Link href="/dashboard" className="hover:text-papaya_whip-500 transition-colors">Get Started</Link></li>
                <li><Link href="/dashboard" className="hover:text-papaya_whip-500 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-papaya_whip-500">Support</h3>
              <ul className="space-y-2 text-sm text-air_superiority_blue-300">
                <li><Link href="/help" className="hover:text-papaya_whip-500 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-papaya_whip-500 transition-colors">Contact Us</Link></li>
                <li><Link href="/community" className="hover:text-papaya_whip-500 transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-papaya_whip-500">Company</h3>
              <ul className="space-y-2 text-sm text-air_superiority_blue-300">
                <li><Link href="/about" className="hover:text-papaya_whip-500 transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-papaya_whip-500 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-papaya_whip-500 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-prussian_blue-400 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-air_superiority_blue-300">
            <p>&copy; 2024 MVT. All rights reserved.</p>
            <p className="flex items-center mt-2 sm:mt-0">
              Made with <Heart className="h-4 w-4 mx-1 text-fire_brick-400" /> for veterans
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
