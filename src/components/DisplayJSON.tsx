"use client";

import React, { useEffect } from "react";

import { cx } from "class-variance-authority";
import { format as prettyFormat } from "pretty-format";

interface Props {
  className?: string;
  consoleLog?: boolean;
  consoleTitle?: string;
  json: string | object | unknown;
  options?: {
    compareKeys?: (_a: string, _b: string) => number;
    escapeString?: boolean;
    maxDepth?: number;
    maxWidth?: number;
    min?: boolean;
    printBasicPrototype?: boolean;
    printFunctionName?: boolean;
  };
}

const defaultOptions = {
  printBasicPrototype: false,
  printFunctionName: false,
};

function DisplayJSON({ className = "", consoleLog, consoleTitle, json, options: optionsProp }: Props) {
  const options = { ...defaultOptions, ...optionsProp };

  useEffect(() => {
    if (!!consoleTitle || consoleLog) {
      console.group(consoleTitle ? `DisplayJSON: ${consoleTitle}` : "DisplayJSON");
      console.log(json);
      console.groupEnd();
    }
  }, [consoleLog, consoleTitle, json]);

  return (
    <div className={cx("text-xs", { [className]: !!className })}>
      <pre
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {prettyFormat(json, options)}
      </pre>
    </div>
  );
}

export default DisplayJSON;
