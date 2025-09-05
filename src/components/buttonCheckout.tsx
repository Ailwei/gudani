"use client";

export default function UpgradeButton({ onClick }: { onClick: () => void }) {
  
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
    >
      Upgrade
    </button>
  );
}
