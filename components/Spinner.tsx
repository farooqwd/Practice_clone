// components/Spinner.tsx
"use client";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center w-full h-[60vh]">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
