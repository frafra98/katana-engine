import { SocialLinks } from './social-links';

export default function Footer() {
  return (
    <footer className='flex flex-col gap-y-2 py-8 bg-background  border-t border-foreground min-h-25'>
      <div className='flex flex-row sm:flex-row justify-center items-center'>
        <p className='text-sm text-muted-foreground text-center'>
          © {new Date().getFullYear()} Francesco Beati. All rights reserved.
        </p>
      </div>
      <SocialLinks />

      <div className='fixed bottom-5 right-5 gap-2 flex flex-row sm:flex-row justify-end items-center'>
        <span>Visit my website:</span>
        <a
          href='https://frakon.vercel.com'
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-ghost btn-icon flex gap-1'
        >
          <span>frakon.com</span>
        </a>
      </div>
    </footer>
  );
}
