"use client";

import { useState, useEffect } from "react";

export default function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleControllerChange = () => {
      setShowUpdate(true);
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    // 페이지 로드 시 서비스 워커 업데이트 체크
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // 이미 대기 중인 새 워커가 있으면 배너 표시
      if (reg.waiting) {
        setShowUpdate(true);
        return;
      }

      // 새 워커 설치 감지
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setShowUpdate(true);
          }
        });
      });

      // 업데이트 강제 확인
      reg.update().catch(() => {});
    });

    // 앱 복귀 시 업데이트 확인
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update().catch(() => {});
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2.5 px-4 text-sm font-medium shadow-lg">
      <span>새 버전이 있습니다. </span>
      <button
        onClick={() => window.location.reload()}
        className="underline font-bold ml-1"
      >
        업데이트하기
      </button>
    </div>
  );
}
