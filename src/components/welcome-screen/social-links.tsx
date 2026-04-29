import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa"

interface SocialLinksProps {
  className?: string
}
export function SocialLinks({ className = "justify-center" }: SocialLinksProps) {
  return (
    <div className={`flex gap-2 ${className}`}>            
      <a href="https://github.com/frafra98" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon">
        <FaGithub className="h-5 w-5" />
        <span className="sr-only">GitHub</span>
      </a>

      <a href="https://x.com/FrakonArt" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon">
        <FaTwitter className="h-5 w-5" />
        <span className="sr-only">Twitter</span>
      </a>

      <a href="https://www.linkedin.com/in/francesco-beati-952129356/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon">
        <FaLinkedin className="h-5 w-5" />
        <span className="sr-only">LinkedIn</span>
      </a>

      <a href="https://instagram.com/frakon" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon">
        <FaInstagram className="h-5 w-5" />
        <span className="sr-only">Instagram</span>
      </a>

      <a href="https://youtube.com/@frakon_3Dart" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon">
        <FaYoutube className="h-5 w-5" />
        <span className="sr-only">YouTube</span>
      </a>
    </div>
  )
}