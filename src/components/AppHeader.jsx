import { FiChevronDown, FiFileText, FiLogOut, FiMoon, FiPlus, FiSun } from "react-icons/fi";
import ampereLogo from "../assets/ampere.png";

const AppHeader = ({ isDark, user, onLogout, onToggleTheme }) => {
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className='border-b border-ampere-line bg-white dark:border-neutral-800 dark:bg-ampere-charcoal'>
      <div className='mx-auto flex h-16  items-center justify-between gap-4 px-5 md:px-8'>
        <a className='flex min-w-0 items-center gap-3' href='#generator' aria-label='SLT Docs Generator'>
          <img className='h-8 w-8 shrink-0' src={ampereLogo} alt='' />
          <span className='truncate text-sm font-bold tracking-wide text-ampere-black dark:text-white'>
            SLT DOCS GENERATOR
          </span>
        </a>

        <div className='flex items-center gap-3 md:gap-6'>
          <button
            type='button'
            title={isDark ? "Use light mode" : "Use dark mode"}
            aria-label={isDark ? "Use light mode" : "Use dark mode"}
            onClick={onToggleTheme}
            className='flex h-9 w-9 items-center justify-center border border-ampere-line text-ampere-muted transition-colors hover:border-ampere-red hover:text-ampere-red dark:border-neutral-700 dark:text-neutral-300'
          >
            {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
          </button>
         
          <div className='hidden items-center gap-3 sm:flex'>
            <span className='flex h-9 w-9 items-center justify-center rounded-full bg-ampere-black text-xs font-semibold text-white dark:bg-ampere-red'>
              {initials}
            </span>
            <div className='hidden lg:block'>
              <p className='text-sm font-medium text-ampere-black dark:text-white'>{displayName}</p>
              <p className='text-xs text-ampere-muted dark:text-neutral-400'>{user.email || user.username}</p>
            </div>
            <FiChevronDown className='text-ampere-muted dark:text-neutral-400' size={18} />
            <button
              type='button'
              title='Sign out'
              aria-label='Sign out'
              onClick={onLogout}
              className='text-ampere-muted transition-colors hover:text-ampere-red dark:text-neutral-400'
            >
              <FiLogOut size={17} />
            </button>
          </div>


        </div>
      </div>
    </header>
  );
};

export default AppHeader;
