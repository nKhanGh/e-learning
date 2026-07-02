"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pathname = usePathname();
  const hideFooter = pathname.endsWith("/chat");
  
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`content bg-white dark:bg-surface border-t border-gray-200 dark:border-border transition-all duration-300 ${hideFooter ? 'hidden' : ''}`}>
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {/* Company Info */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-text">
                Learnio
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-muted">
              {t('description')}
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-text uppercase tracking-wider mb-3.5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('careers')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-text uppercase tracking-wider mb-3.5">
              {t('support')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/help"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {/* {t('contactUs')} */}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-text uppercase tracking-wider mb-3.5">
              {t('getInTouch')}
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="w-3.5 h-3.5 text-primary mt-1 flex-shrink-0"
                />
                <span className="text-xs text-gray-600 dark:text-muted">
                  {t('district')}
                  <br />
                  {t('province')}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-3.5 h-3.5 text-primary flex-shrink-0"
                />
                <a
                  href="tel:+1234567890"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('phone')}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-3.5 h-3.5 text-primary flex-shrink-0"
                />
                <a
                  href="mailto:info@yourcompany.com"
                  className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('email')}
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-5">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-text mb-1.5">
                {t('newsletter')}
              </h4>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder={t('yourEmail')}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-border border border-gray-200 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-text placeholder-gray-500 dark:placeholder-muted"
                />
                <button className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-md transition-colors">
                  {t('subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-border">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-7 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3.5">
            <p className="text-xs text-gray-600 dark:text-muted text-center sm:text-left">
              &copy; {currentYear} Learnio. {t('rightsReserved')}
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="/privacy"
                className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/terms"
                className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
              >
                {t('terms')}
              </Link>
              <Link
                href="/cookies"
                className="text-xs text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
              >
                {t('cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-7 right-7 w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Scroll to top"
      >
        <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
      </button>
    </footer>
  );
};

export default Footer;
