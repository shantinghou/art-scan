"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { MdPhotoCamera, MdUploadFile, MdSearch, MdAutorenew } from "react-icons/md";

interface ArtworkMetadata {
  title: string;
  artist: string;
  year: string;
  medium: string;
  price: number;
  dimensions: string;
  location: string;
  description: string;
  confidence: number; // 0-1
}

const GOOGLE_APP_SCRIPT = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT;

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ArtworkMetadata | null>(null);
  const [editing, setEditing] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<Record<string, unknown> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setRawApiResponse(null);
    setMetadata(null);
    setHasConfirmed(false);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setMetadata(null);
    setRawApiResponse(null);
    setHasConfirmed(false);
    try {
      const res = await fetch("/gemini-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      setRawApiResponse(data);
      if (data.error) throw new Error(data.error);
      // Set price to 0 and location to '' by default, let user edit
      setMetadata({
        ...data,
        price: 0,
        location: '',
        dimensions: data.dimensions || '',
      });
      setEditing(data.confidence < 0.8);
    } catch (e) {
      if (e instanceof Error) {
        setFormError(e.message);
      } else {
        setMetadata({
          title: "",
          artist: "",
          year: "",
          medium: "",
          price: 0,
          dimensions: "",
          location: "",
          description: "Unknown error",
          confidence: 0,
        });
      }
    }
    setEditing(true);
    setLoading(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!metadata) return;
    let value: string | number = e.target.value;
    if (e.target.name === "price") {
      value = Number(value);
    }
    setMetadata({ ...metadata, [e.target.name]: value });
  };

  // const handleEditClick = () => {
  //   setEditing(true);
  //   setHasConfirmed(false);
  // };

  const handleConfirm = async () => {
    setFormError(null);
    // setFormSuccess(null);
    if (!metadata?.artist || metadata.artist.trim() === "") {
      setFormError("Artist is required.");
      return;
    }
    setEditing(false);
    setHasConfirmed(true);
    if (!GOOGLE_APP_SCRIPT) {
      setFormError("Google Apps Script URL is not set.");
      return;
    }
    try {
      await fetch(GOOGLE_APP_SCRIPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metadata.title || "",
          artist: metadata.artist,
          year: metadata.year || "",
          medium: metadata.medium || "",
          price: metadata.price || 0,
          dimensions: metadata.dimensions || "",
          location: metadata.location || "",
          description: metadata.description || "",
        }),
        mode: "no-cors"
      });
      // setFormSuccess("Submitting...");
    } catch {
      setFormError("Failed to submit to Google Apps Script.");
    }
  };

  const handleClear = () => {
    setImage(null);
    setRawApiResponse(null);
    setMetadata(null);
    setEditing(false);
    setHasConfirmed(false);
    setFormError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full justify-center bg-[#09192A]/70 items-center p-8 mb-10">
        <div className="rounded-full p-3 flex justify-center items-center mt-5">
          <Image src="/assets/images/logo.png" alt="Logo" width={64} height={64} />
        </div>
        {image ? (
          <div className="mb-4 flex flex-col items-center mt-10">
            <div className="relative">
              <Image src={image} alt="Artwork preview" width={0} height={0} style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '60vh', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} unoptimized />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 px-4 py-2 bg-white/70 text-black rounded-full shadow hover:bg-white/90 transition z-10"
                aria-label="Clear"
              >
                <span>Clear</span>
              </button>
            </div>
            {rawApiResponse ? (<></>) : (<button
              className="px-4 py-2 bg-white/70 text-white rounded-full flex items-center justify-center hover:bg-white/30"
              onClick={handleAnalyze}
              disabled={loading}
              aria-label="Analyze Artwork"
            >
              {loading ? (
                <MdAutorenew size={28} className="animate-spin" />
              ) : 
              ( <MdSearch size={28} /> 
              )}
            </button>)}
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center items-center mt-10">
            <p className="mb-6 text-center max-w-xl text-white text-2xl rounded-lg px-4 py-2">Upload or take photo of interested artwork.</p>
          </div>
        )}
      </div>
      
      {metadata && (
        <div className="w-full max-w-md bg-white/50 dark:bg-[#222]/80 rounded shadow p-4 md:mt-4">
          <h2 className="text-xl font-semibold mb-2">Artwork Metadata</h2>
          {editing ? (
            <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleConfirm(); }}>
              <label>
                Title:
                <input name="title" value={metadata.title} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Artist:
                <input name="artist" value={metadata.artist} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Year:
                <input name="year" value={metadata.year} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Medium:
                <input name="medium" value={metadata.medium} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Price:
                <input name="price" type="number" value={metadata.price} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Dimensions:
                <input name="dimensions" value={metadata.dimensions} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Location:
                <input name="location" value={metadata.location} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <label>
                Description:
                <textarea name="description" value={metadata.description} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
              </label>
              <button type="submit" className="mt-2 px-4 py-2 bg-[#09192A]/70 text-white rounded hover:bg-[#09192A]">Add</button>
            </form>
          ) : (
            <div className="flex flex-col gap-1">
              <div><b>Title:</b> {metadata.title}</div>
              <div><b>Artist:</b> {metadata.artist}</div>
              <div><b>Year:</b> {metadata.year}</div>
              <div><b>Medium:</b> {metadata.medium}</div>
              <div><b>Price:</b> {metadata.price}</div>
              <div><b>Dimensions:</b> {metadata.dimensions}</div>
              <div><b>Location:</b> {metadata.location}</div>
              <div><b>Description:</b> {metadata.description}</div>
              <div className="mt-2 text-xs text-gray-500">AI Confidence: {(metadata.confidence * 100).toFixed(0)}%</div>
              {metadata.confidence < 0.8 && (
                <div className="text-yellow-600 text-sm mt-1">AI was unsure. Please review and confirm the details.</div>
              )}
              {/* <button
                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 self-start"
                onClick={handleEditClick}
              >
                Edit
              </button> */}
              {hasConfirmed && (
                <div className="text-green-600 text-sm mt-1">Metadata confirmed!</div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Hidden file input for camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleImageChange}
      />
      {/* Hidden file input for upload */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      {/* Icon buttons for photo and upload */}
      <div className="flex gap-6 mb-6 mt-10">
        {/* Take Photo Icon */}
        <button
          type="button"
          aria-label="Take Photo"
          className="w-16 h-16 flex items-center justify-center rounded-full bg-white/70 shadow hover:bg-white/90 transition"
          onClick={handleCameraClick}
          disabled={loading}
        >
          <MdPhotoCamera size={32} />
        </button>
        {/* Upload Icon */}
        <button
          type="button"
          aria-label="Upload Image"
          className="w-16 h-16 flex items-center justify-center rounded-full bg-white/70 shadow hover:bg-white/90 transition"
          onClick={handleUploadClick}
          disabled={loading}
        >
          <MdUploadFile size={32} />
        </button>
      </div>
      
      {/* {rawApiResponse && (
        <pre className="w-full max-w-md bg-gray-100 dark:bg-gray-900 rounded shadow p-2 mt-2 text-xs overflow-x-auto">
          {JSON.stringify(rawApiResponse, null, 2)}
        </pre>
      )} */}
      {formError && (
        <div className="text-red-600 text-sm mt-2">{formError}</div>
      )}
      {/* {formSuccess && (
        <div className="text-green-600 text-sm mt-2">{formSuccess}</div>
      )} */}
      <footer className="mt-8 text-xs text-white/40 mb-5">Art Scan Beta &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
