const Footer = () => {
  return (
    <footer className="glass-effect border-t border-gray-300/50 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;