import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
