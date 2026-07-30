"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function Counter({ value, duration = 2 }: { value: number, duration?: number }) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}
