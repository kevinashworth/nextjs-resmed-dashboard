"use client";

import { useState } from "react";

import HuePicker from "simple-hue-picker/react";

function SettingsPage() {
  const [selected, setSelected] = useState(120);

  function onInputChange(e: CustomEvent) {
    setSelected(e.detail);
    console.log(e.detail);
  }

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <HuePicker value={selected} onChange={onInputChange} />
      <p className="text-accent-100 dark:text-accent-600">{selected} [0 - 360]</p>
    </div>
  );
}

export default SettingsPage;
