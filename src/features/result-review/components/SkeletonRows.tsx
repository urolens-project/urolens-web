interface Props {
  cols: number;
}

export function SkeletonRows({ cols }: Props) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
          <td className="px-5 py-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded-md w-32" />
              <div className="h-2.5 bg-slate-100 rounded-md w-16" />
            </div>
          </td>
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-3 bg-slate-100 rounded-md w-20" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
