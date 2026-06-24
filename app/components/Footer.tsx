import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
  const pages = [
    { name: "diary", href: "/diary" },
    { name: 'pomodoro', href: '/timer' },
    { name: "todos", href: "/todo" },
    { name: "notes", href: "/note" },
  ];
  const navlinks = [
    { name: "home", href: "/" },
    { name: "about", href: "/about" },
  ];
  const social = [
    { name: 'github', href: process.env.NEXT_PUBLIC_GITHUB || 'https://github.com/', icon: FaGithub },
    { name: 'instagram', href: process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/', icon: FaInstagram },
    { name: 'linkedin', href: process.env.NEXT_PUBLIC_LINKEDIN || 'https://www.linkedin.com/', icon: FaLinkedin },
    { name: 'twitter', href: process.env.NEXT_PUBLIC_TWITTER || 'https://twitter.com/', icon: FaXTwitter }
  ];

  return (
    <footer className="w-full bg-muted/10 dark:bg-card/20 backdrop-blur-md border-t border-border/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand/About */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-5">
            <Link href="/" className="group relative">
              <span className="text-2xl font-light tracking-tight transition-all duration-300 group-hover:tracking-wide">
                Daily Dock
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary dark:bg-muted-foreground transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <p className="text-sm text-accent dark:text-muted-foreground max-w-md leading-relaxed mt-2">
              Navigate your day with precision. Keep track of your thoughts, manage your tasks, capture notes, and maintain your flow with an integrated Pomodoro timer—all in one beautiful ecosystem.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-4">
              {social.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-secondary/50 dark:bg-accent/15 border border-border/40 hover:border-primary/50 text-accent dark:text-muted-foreground hover:text-primary hover:bg-primary/5 hover:scale-110 transition-all duration-300"
                    aria-label={item.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Pages */}
          <div className="flex flex-col gap-4 lg:col-span-2 lg:col-start-7">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Pages</h3>
            <ul className="flex flex-col gap-2.5">
              {pages.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-sm text-accent dark:text-muted-foreground hover:text-primary transition-colors duration-200 capitalize hover:underline underline-offset-4"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Navigation</h3>
            <ul className="flex flex-col gap-2.5">
              {navlinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-sm text-accent dark:text-muted-foreground hover:text-primary transition-colors duration-200 capitalize hover:underline underline-offset-4"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Ecosystem</h3>
            <p className="text-xs text-accent dark:text-muted-foreground leading-relaxed">
              Designed for high productivity and focus. Join us today and elevate your daily organization.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-border/30 bg-muted/5 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-accent dark:text-muted-foreground">
            © {new Date().getFullYear()} Daily Dock. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-accent dark:text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
