import { clsx } from 'clsx'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth, 
  disabled, 
  onClick,
  icon: Icon,
  className 
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 active:shadow-primary-600/50',
    secondary: 'bg-gray-100 text-gray-900 active:bg-gray-200',
    outline: 'border-2 border-primary-600 text-primary-600 active:bg-primary-50',
    ghost: 'text-primary-600 active:bg-primary-50',
    success: 'bg-accent-600 text-white shadow-lg shadow-accent-600/30',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  )
}

export default Button
