"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/404");
    }
  }, [router]);
};

export default useAuthRedirect;