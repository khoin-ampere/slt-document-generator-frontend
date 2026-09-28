import { useState } from "react";
import { FiFileText, FiMoon, FiSun } from "react-icons/fi";
import ampereLogo from "../assets/ampere.png";
import loginBackground from "../assets/ampere_wallpaper.png"

const LoginPage = ({ isDark, onLogin, onToggleTheme, serviceError }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onLogin({ username, password });
    } catch (loginError) {
      setError(loginError.message);
      setIsSubmitting(false);
    }
  };

 return (
  <main className={isDark ? "dark min-h-screen" : "min-h-screen"}>
    <div
      className='relative min-h-screen bg-cover bg-center bg-no-repeat text-ampere-black dark:text-white'
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className='absolute inset-0 ' />

      <div className='relative z-10 min-h-screen'>
        <header className='border-b border-ampere-line bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-ampere-charcoal/80'>
          <div className='mx-auto flex h-16 items-center justify-between px-5 md:px-8'>
            <div className='flex items-center gap-3'>
              <img className='h-8 w-8' src={ampereLogo} alt='' />

              <span className='text-sm font-bold tracking-wide text-ampere-black dark:text-white'>
                SLT DOCS GENERATOR
              </span>
            </div>

            <button
              type='button'
              title={isDark ? "Use light mode" : "Use dark mode"}
              aria-label={isDark ? "Use light mode" : "Use dark mode"}
              onClick={onToggleTheme}
              className='flex h-9 w-9 items-center justify-center border border-ampere-line text-ampere-muted transition-colors hover:border-ampere-red hover:text-ampere-red dark:border-neutral-700 dark:text-neutral-300'
            >
              {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>
          </div>
        </header>

        <div className=' flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-5 py-12 md:px-8'>
          <form
            onSubmit={handleSubmit}
            className='w-full max-w-lg border border-ampere-line bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:border-neutral-700 dark:bg-ampere-charcoal/95'
          >
            <span className='mb-6 flex h-9 w-9 items-center justify-center bg-ampere-red text-white'>
              <FiFileText size={18} />
            </span>

            <h1 className='text-2xl font-semibold text-ampere-black dark:text-white'>
              Sign in
            </h1>

            <p className='mt-2 text-sm leading-6 text-ampere-muted dark:text-neutral-400'>
              Use the SLT Docs account created for you by an administrator.
            </p>

            {serviceError && (
              <p className='mt-4 text-sm text-ampere-red'>{serviceError}</p>
            )}

            <label className='mt-7 grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200'>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete='username'
                required
                className='h-11 border border-ampere-line bg-white px-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white'
              />
            </label>

            <label className='mt-5 grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200'>
              Password
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete='current-password'
                required
                className='h-11 border border-ampere-line bg-white px-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white'
              />
            </label>

            {error && <p className='mt-4 text-sm text-ampere-red'>{error}</p>}

            <button
              type='submit'
              disabled={isSubmitting}
              className='mt-7 inline-flex items-center justify-center bg-ampere-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ampere-red-dark disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>
);
};

export default LoginPage;
