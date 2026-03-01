import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";

interface Mess {
  _id: string;
  name: string;
}

export function useMesses() {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/mess/list")
      .then((res) => setMesses(res.data.messes || []))
      .catch(() => setMesses([]))
      .finally(() => setLoading(false));
  }, []);

  return { messes, loading };
}
