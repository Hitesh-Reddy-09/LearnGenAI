import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Github, Twitter, Linkedin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { colors } = useTheme();
  
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="mt-24 dark:border-white/10 border-gray-200 border-t dark:bg-black/50 bg-white/80 backdrop-blur-sm transition-colors duration-300"
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-xl dark:bg-white bg-gray-900">
                <Brain className="h-6 w-6 dark:text-black text-white" />
              </div>
              <span className="text-xl font-bold dark:text-white text-gray-900">
                LearnGenAI
              </span>
            </div>
            <p className="dark:text-gray-400 text-gray-600 max-w-md">
              Revolutionizing education with AI-powered course generation. 
              Create personalized learning experiences in seconds.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 dark:text-white text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Generate Course', 'Dashboard', 'About'].map((link) => (
                <li key={link}>
                  <a href="#" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4 dark:text-white text-gray-900">Connect</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 dark:text-white text-gray-900" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 dark:border-white/10 border-gray-200 border-t text-center dark:text-gray-400 text-gray-600">
          <p>&copy; {new Date().getFullYear()} LearnGenAI. Crafted with ❤️ for learners everywhere.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;