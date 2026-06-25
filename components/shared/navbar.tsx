"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";


import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { ModeToggle } from "../providers/mode-toggle";

import { MobileSidebar } from "../landing/mobile-sidebar";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Tools",
    href: "/tools",
  },
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white backdrop-blur-xl dark:border-zinc-900/60 dark:bg-black/80">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                Tool
                <span className="bg-linear-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-500 bg-clip-text text-transparent">
                  Stack
                </span>
              </h1>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" &&
                    pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`
                      relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? `
                            bg-linear-to-r from-purple-600 to-violet-600 text-white
                            `
                          : `
                            border border-zinc-400 dark:border-zinc-900 dark:hover:border-zinc-800 text-zinc-900 dark:text-white/60 dark:hover:text-white
                            `
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            <Button
              variant="default"
              className="hidden md:flex cursor-pointer py-2"
              onClick={() => window.open("https://github.com/lazytech614/tool-stack")}
            >
              <FaGithub className="mr-2 h-4 w-4" />
              Star on GitHub
            </Button>

            {/* Mobile Menu */}
            <MobileSidebar />
          </div>
        </div>
      </Container>
    </header>
  );
}