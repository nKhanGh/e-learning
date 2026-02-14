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

const Footer = ({ openSidebar }: { openSidebar: boolean }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white dark:bg-surface border-t border-gray-200 dark:border-border transition-all duration-300 ${openSidebar ? 'ml-64' : 'ml-20'}`}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-text">
                Learnio
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-muted">
              {t('description')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-border hover:bg-primary dark:hover:bg-primary flex items-center justify-center text-gray-600 dark:text-muted hover:text-white transition-all duration-300"
                aria-label="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-text uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('careers')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-text uppercase tracking-wider mb-4">
              {t('support')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {/* {t('contactUs')} */}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-text uppercase tracking-wider mb-4">
              {t('getInTouch')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="w-4 h-4 text-primary mt-1 flex-shrink-0"
                />
                <span className="text-sm text-gray-600 dark:text-muted">
                  {t('district')}
                  <br />
                  {t('province')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-4 h-4 text-primary flex-shrink-0"
                />
                <a
                  href="tel:+1234567890"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('phone')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-4 h-4 text-primary flex-shrink-0"
                />
                <a
                  href="mailto:info@yourcompany.com"
                  className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {t('email')}
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-text mb-2">
                {t('newsletter')}
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('yourEmail')}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-border border border-gray-200 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-text placeholder-gray-500 dark:placeholder-muted"
                />
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
                  {t('subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-muted text-center sm:text-left">
              &copy; {currentYear} Learnio. {t('rightsReserved')}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
              >
                {t('terms')}
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-gray-600 dark:text-muted hover:text-primary dark:hover:text-primary transition-colors"
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
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Scroll to top"
      >
        <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
