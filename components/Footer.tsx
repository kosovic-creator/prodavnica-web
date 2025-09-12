import { APP_NAME } from '@/lib/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t'>
      <div className='p-5 flex-center text-zinc-400'  >
        {currentYear} {APP_NAME}. All Rights Reserved by Draško Kosović
      </div>
    </footer>
  );
};

export default Footer;