import React from 'react';

export const SkeletonBox = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded-lg shimmer-effect animate-pulse ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
    <SkeletonBox className="h-4 w-1/3" />
    <SkeletonBox className="h-8 w-2/3" />
    <SkeletonBox className="h-4 w-1/2" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
    <div className="space-y-2">
      <SkeletonBox className="h-3.5 w-24" />
      <SkeletonBox className="h-7 w-16" />
      <SkeletonBox className="h-3 w-28" />
    </div>
    <SkeletonBox className="w-12 h-12 rounded-xl" />
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <SkeletonBox className={`h-4 ${i === 0 ? 'w-48' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

export const ProfileSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
    <div className="flex items-center gap-4">
      <SkeletonBox className="w-20 h-20 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonBox className="h-6 w-48" />
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-4 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
      <SkeletonBox className="h-12 w-full rounded-xl" />
      <SkeletonBox className="h-12 w-full rounded-xl" />
      <SkeletonBox className="h-12 w-full rounded-xl" />
      <SkeletonBox className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

const SkeletonLoader = ({ type = 'card', count = 1, columns = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        if (type === 'card') return <CardSkeleton key={index} />;
        if (type === 'statCard') return <StatCardSkeleton key={index} />;
        if (type === 'tableRow') return <TableRowSkeleton key={index} columns={columns} />;
        if (type === 'profile') return <ProfileSkeleton key={index} />;
        return <SkeletonBox key={index} className="h-6 w-full" />;
      })}
    </>
  );
};

export default SkeletonLoader;
