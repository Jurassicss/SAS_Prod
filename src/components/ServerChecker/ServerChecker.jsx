// components/ServerChecker.jsx
'use client';
import { useEffect, useState } from "react";
import ServerError from "../ServerError/ServerError";

export default function ServerChecker({ children }) {
  const [serverAvailable, setServerAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkServer() {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("Сервер недоступен");
        setServerAvailable(true);
      } catch {
        setServerAvailable(false);
      } finally {
        setLoading(false);
      }
    }
    checkServer();
  }, []);

  if (loading) return <p>Проверка сервера...</p>;
  if (!serverAvailable) return <ServerError message="Сервер недоступен" />;

  return children;
}
