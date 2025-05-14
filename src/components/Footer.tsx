
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Mail, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mt-4 text-gray-600 max-w-md">
              GREP is your smart GRE preparation assistant, powered by AI to help you study more efficiently and effectively.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-grep-500 transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-grep-500 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-grep-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-600 hover:text-grep-500 transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-grep-500 transition-colors">About</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-grep-500 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-grep-500 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-grep-500 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} GREP - GRE Smart Prep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
