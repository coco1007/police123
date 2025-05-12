'use client';

import { useEffect, useState } from 'react';

interface DatabaseStatus {
  connected: boolean;
  state: number;
  host: string;
  name: string;
}

interface HealthResponse {
  status: string;
  database: DatabaseStatus;
  message?: string;
  stack?: string;
}

export default function HealthPage() {
  const [status, setStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000); // 5초마다 상태 확인

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">데이터베이스 상태 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">데이터베이스 상태</h1>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">오류 발생</p>
          <p>{error}</p>
        </div>
      ) : status && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            status.database.connected 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <p className="font-bold">연결 상태: {status.database.connected ? '연결됨' : '연결 끊김'}</p>
            <p>호스트: {status.database.host}</p>
            <p>데이터베이스: {status.database.name}</p>
            <p>상태 코드: {status.database.state}</p>
          </div>
          
          {status.message && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="font-bold">메시지</p>
              <p>{status.message}</p>
              {status.stack && (
                <pre className="mt-2 text-sm overflow-auto">
                  {status.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 