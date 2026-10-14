import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
  headerClassName = 'px-5 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200/80 shadow-xs
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={headerClassName}>
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};

export default Card;
