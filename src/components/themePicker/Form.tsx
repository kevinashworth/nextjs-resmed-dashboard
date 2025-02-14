"use client";

import { RefObject, useMemo, useRef } from "react";

import dynamic from "next/dynamic";

import debounce from "@/lib/debounce";

import { Field } from "../Field";
import { Switch } from "../Switch";

const HuePicker = dynamic(() => import("simple-hue-picker/react"), {
  ssr: false,
});

export const FormContent = ({
  darkMode,
  hue,
}: {
  darkMode: boolean;
  hue: string;
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onChangeDebounced = useMemo(() => makeOnChange(rootRef), []);

  function makeOnChange(rootRef: RefObject<HTMLDivElement | null>) {
    return debounce(() => {
      if (!rootRef.current) return;

      let current: HTMLElement | null | undefined = rootRef.current;
      while (current?.tagName !== "FORM") {
        current = current?.parentElement;
      }
      if (current?.tagName === "FORM") {
        (current as HTMLFormElement).requestSubmit();
      }
    }, 300);
  }

  return (
    <div
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6"
      ref={rootRef}
    >
      <div className="sm:col-span-3">
        <Field id="hue" label="Favorite Color">
          <div className="h-2">
            <HuePicker name="hue" onChange={onChangeDebounced} value={hue} />
          </div>
        </Field>
      </div>
      <div className="col-span-full">
        <Field id="dark-mode" label="Force dark mode">
          <Switch
            defaultChecked={darkMode}
            label="Force dark mode"
            name="force-dark"
            onChange={onChangeDebounced}
          />
        </Field>
      </div>
    </div>
  );
};
