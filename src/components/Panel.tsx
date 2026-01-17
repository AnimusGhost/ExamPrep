import { ReactNode } from 'react';

const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`panel p-5 ${className}`}>{children}</div>
);

export default Panel;
