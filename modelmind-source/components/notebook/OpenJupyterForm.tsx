"use client";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function OpenJupyterForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={`${API_URL}/jupyter/open`}
      method="post"
      rel="noopener noreferrer"
      target="_blank"
    >
      <button className={className} type="submit">
        {children}
      </button>
    </form>
  );
}
