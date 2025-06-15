import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from '@/components/ModeToggle';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Directory', href: '/directory' },
    { label: 'AI Search', href: '/ai-search' },
    { label: 'Events', href: '/events' },
    { label: 'Forum', href: '/forum' },
    { label: 'Analytics', href: '/analytics' },
    { 
      label: 'Enterprise', 
      href: '#',
      submenu: [
        { label: 'Dashboard', href: '/enterprise' },
        { label: 'Analytics', href: '/enterprise-analytics' },
        { label: 'Integrations', href: '/enterprise-integrations' }
      ]
    },
    { 
      label: 'AI Hub', 
      href: '/intelligence-hub'
    }
  ];

  return (
    <header className="bg-gray-900 text-white py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          BAMA AI Nexus
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            {navItems.map((item, index) => (
              item.submenu ? (
                <NavigationMenuItem key={index}>
                  <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] grid-cols-2">
                      {item.submenu.map((sub, i) => (
                        <li key={i}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={sub.href}
                              className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[active]:bg-accent data-[active]:text-accent-foreground"
                            >
                              {sub.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={index}>
                  <Link to={item.href} className="px-3 py-2 rounded-md hover:bg-gray-800">
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              )
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {/* <Button variant="outline">Sign In</Button> */}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-900 text-white w-64">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Explore the BAMA AI Nexus
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="block px-4 py-2 rounded-md hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <ModeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
