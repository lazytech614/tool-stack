"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { DiCodeigniter } from "react-icons/di";

import { Button } from "@/components/ui/button";
import { Container } from "../shared/container";
import { ModeToggle } from "../providers/mode-toggle";

import { MobileSidebar } from "./mobile-sidebar";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants/configs/configs";
import { MegaMenu } from "../shared/mega-menu/mega-menu";
import { learningSections } from "@/constants/navigation/learning-menu";
import { resourceSections } from "@/constants/navigation/resource-menu";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white backdrop-blur-xl dark:border-zinc-900/60 dark:bg-black/80">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <DiCodeigniter className="h-5 w-5" />
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
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-900/70 rounded-lg"
                    }`}
                  >
                    {link.label}

                    <span
                      className={`absolute left-0 -bottom-1 h-0.5 rounded-full bg-linear-to-r from-purple-500 via-fuchsia-500 to-violet-500 transition-all duration-300 ${
                        isActive
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
              
              {/* Learning Mega Menu */}
              <MegaMenu
                label="Learn"
                sections={learningSections}
                align="left"
              />

              {/* Resources Mega Menu */}
              <MegaMenu
                label="Resources"
                sections={resourceSections}
                align="left"
              />
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