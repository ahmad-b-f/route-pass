"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCachedStudent } from "@/lib/session";

export default function StudentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (getCachedStudent()) {
      router.replace("/student/pass");
    } else {
      router.replace("/");
    }
  }, [router]);

  return null;
}
