interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8 select-none">
      <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
      <p className="text-xs text-gray-500 font-mono mt-1">// {subtitle}</p>
    </div>
  );
}
