// Temporary file to check and show how uploading and loading files works
// You can base on it when creating logic for uploading / loading files
// Should be removed later


import { useState } from "react";

const API = "/api/test/single-image";

type FileInfo = {
  id: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
};

function FileUploadTest() {
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API, { method: "POST", body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(`${res.status}: ${body?.error ?? res.statusText}`);
      }

      setInfo(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <input
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        onChange={handleChange}
        disabled={loading}
      />

      {loading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {info && (
        <div>
          <pre>{JSON.stringify(info, null, 2)}</pre>

          {info.contentType.startsWith("image/") ? (
            <img
              src={`${API}/${info.id}`}
              alt={info.filename}
              style={{ maxWidth: 300, border: "1px solid #ccc" }}
            />
          ) : (
            <a href={`${API}/${info.id}`} target="_blank" rel="noreferrer">
              Open {info.filename}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export { FileUploadTest };
