'use client';
export default function BackButton({ label = "Back to results" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => history.back()}
      className="btn-ghost"
      aria-label={label}
    >
      {label}
    </button>
  );
}
