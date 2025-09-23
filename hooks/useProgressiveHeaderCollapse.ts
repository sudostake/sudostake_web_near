"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type HeaderCollapseResult = {
  stuck: boolean;
  isMobile: boolean;
  // Title presentation
  titleStyle: React.CSSProperties | undefined;
  titleCentered: boolean;
  // Progress values (0..1)
  pBal: number;
  pId: number;
  // Section refs and styles
  identityRef: React.RefObject<HTMLDivElement | null>;
  balancesRef: React.RefObject<HTMLDivElement | null>;
  identityStyle: React.CSSProperties | undefined;
  balancesStyle: React.CSSProperties | undefined;
};

export type HeaderCollapseOptions = {
  /** First collapse threshold in px after sticky engages (hides balances). Default: 40 */
  t1?: number;
  /** Second collapse threshold in px after sticky (hides identity). Default: 120 */
  t2?: number;
  /** Fade length in px for gradient mask at max collapse progress. Default: 20 */
  maxFade?: number;
};

/**
 * Smooth, progressive header collapsing with staged fades and height compression.
 * Drives the toolbar title centering and the animated identity/balances sections.
 */
export function useProgressiveHeaderCollapse(
  sentinelId: string,
  opts: HeaderCollapseOptions = {}
): HeaderCollapseResult {
  const COLLAPSE_T1 = opts.t1 ?? 40;
  const COLLAPSE_T2 = opts.t2 ?? 120;
  const MAX_FADE = opts.maxFade ?? 20;

  // Sticky state (for border/shadow on parent header)
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const rootStyles = getComputedStyle(document.documentElement);
    const navVar = rootStyles.getPropertyValue("--nav-height").trim();
    const navPx = navVar.endsWith("px") ? Number(navVar.replace("px", "")) : Number(navVar || 56);
    const rootMargin = `-${isNaN(navPx) ? 56 : navPx}px 0px 0px 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const next = entry.intersectionRatio < 1;
        setStuck((prev) => (prev !== next ? next : prev));
      },
      { root: null, rootMargin, threshold: [1] }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [sentinelId]);

  // Progressive collapse progress values
  const [scrollDelta, setScrollDelta] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const identityRef = useRef<HTMLDivElement>(null);
  const balancesRef = useRef<HTMLDivElement>(null);
  const [identityH, setIdentityH] = useState(0);
  const [balancesH, setBalancesH] = useState(0);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const rootStyles = getComputedStyle(document.documentElement);
    const navVar = rootStyles.getPropertyValue("--nav-height").trim();
    const navPx = navVar.endsWith("px") ? Number(navVar.replace("px", "")) : Number(navVar || 56);
    let collapseStart = 0; // scrollY where sticky begins
    const computeStart = () => {
      const rect = sentinel.getBoundingClientRect();
      collapseStart = Math.max(0, window.scrollY + rect.top - (isNaN(navPx) ? 56 : navPx));
    };
    computeStart();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const delta = window.scrollY - collapseStart;
        setScrollDelta(delta);
      });
    };
    const onResize = () => {
      computeStart();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll as EventListener);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [sentinelId]);

  // Mobile detection (sm breakpoint)
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const update = () => setIsMobile(!mql.matches);
    update();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    } else {
      // Safari <14 fallback
      // @ts-ignore
      mql.addListener(update);
      return () => {
        // @ts-ignore
        mql.removeListener(update);
      };
    }
  }, []);

  // Measure natural heights for smooth max-height transitions
  useEffect(() => {
    const measure = () => {
      if (identityRef.current) setIdentityH(identityRef.current.scrollHeight);
      if (balancesRef.current) setBalancesH(balancesRef.current.scrollHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (identityRef.current) ro.observe(identityRef.current);
    if (balancesRef.current) ro.observe(balancesRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // Derived smooth progress values (0..1)
  const pBal = useMemo(() => {
    if (!isMobile) return 0;
    const d = Math.max(0, scrollDelta);
    return Math.max(0, Math.min(1, d / COLLAPSE_T1));
  }, [scrollDelta, isMobile, COLLAPSE_T1]);
  const pId = useMemo(() => {
    if (!isMobile) return 0;
    const d = Math.max(0, scrollDelta - COLLAPSE_T1);
    return Math.max(0, Math.min(1, d / Math.max(1, COLLAPSE_T2 - COLLAPSE_T1)));
  }, [scrollDelta, isMobile, COLLAPSE_T1, COLLAPSE_T2]);

  // Dynamic fade lengths for gradient masks
  const fadeLenBal = Math.max(0, Math.round(MAX_FADE * pBal));
  const fadeLenId = Math.max(0, Math.round(MAX_FADE * pId));

  // Styles
  const titleStyle: React.CSSProperties | undefined = isMobile
    ? {
        transform: `scale(${1 - pId * 0.02})`,
        transition: "transform 150ms ease-out",
      }
    : undefined;
  const identityStyle: React.CSSProperties | undefined = isMobile && identityH > 0
    ? {
        marginTop: Math.max(0, 4 * (1 - pId)),
        maxHeight: `${Math.max(0, identityH * (1 - pId))}px`,
        opacity: 1 - pId,
        transform: `translateY(-${Math.round(pId * 6)}px)`,
        transition: "max-height 160ms ease-out, opacity 160ms ease-out, transform 160ms ease-out, margin-top 160ms ease-out",
        pointerEvents: pId > 0.95 ? "none" : undefined,
        WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - ${fadeLenId}px), rgba(0,0,0,0) 100%)`,
        maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - ${fadeLenId}px), rgba(0,0,0,0) 100%)`,
      }
    : { marginTop: 4 };
  const balancesStyle: React.CSSProperties | undefined = isMobile && balancesH > 0
    ? {
        marginTop: Math.max(0, 8 * (1 - pBal)),
        maxHeight: `${Math.max(0, balancesH * (1 - pBal))}px`,
        opacity: 1 - pBal,
        transform: `translateY(-${Math.round(pBal * 6)}px)`,
        transition: "max-height 160ms ease-out, opacity 160ms ease-out, transform 160ms ease-out, margin-top 160ms ease-out",
        pointerEvents: pBal > 0.95 ? "none" : undefined,
        WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - ${fadeLenBal}px), rgba(0,0,0,0) 100%)`,
        maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - ${fadeLenBal}px), rgba(0,0,0,0) 100%)`,
      }
    : { marginTop: 8 };

  const titleCentered = isMobile && pId > 0.25;

  return {
    stuck,
    isMobile,
    titleStyle,
    titleCentered,
    pBal,
    pId,
    identityRef,
    balancesRef,
    identityStyle,
    balancesStyle,
  };
}
