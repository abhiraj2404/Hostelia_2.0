import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";

interface Hostel {
  _id: string;
  name: string;
}

export function useHostels() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/hostel/list")
      .then((res) => setHostels(res.data.hostels || []))
      .catch(() => setHostels([]))
      .finally(() => setLoading(false));
  }, []);

  return { hostels, loading };
}
