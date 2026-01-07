import { clsx } from 'clsx'

const Card = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        onClick && 'active:scale-[0.98] transition-transform cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card
