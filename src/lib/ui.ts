// Shared Tailwind class strings so buttons/inputs look the same everywhere
// without pulling in a component library for a handful of variants.
export const buttonPrimary =
  "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSecondary =
  "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonDanger =
  "inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

export const input =
  "rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export const label = "text-sm font-medium text-gray-700";

export const card = "rounded-xl border border-gray-200 bg-white p-4 shadow-sm";

export const pageShell = "mx-auto flex min-h-[calc(100vh-57px)] max-w-3xl flex-col gap-6 px-4 py-10";
