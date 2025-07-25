"use client";
import { useState, useEffect } from "react";

export default function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
  }, []);

  const show = () => {
    if (!isTouchDevice) setVisible(true);
  };

  const hide = () => {
    if (!isTouchDevice) setVisible(false);
  };

  const toggle = () => {
    if (isTouchDevice) setVisible((v) => !v);
  };

  return (
    <div
      className="relative inline-block group"
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={toggle}
    >
      {children}
      {visible && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-100 shadow-lg  w-52">
          {content}
        </div>
      )}
    </div>
  );
}
