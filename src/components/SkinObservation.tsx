// ================================================================
// DERMATHERM FRONTEND — Skin Observation Module (YouCam)
// ================================================================

import { useState, useRef } from "react";
import { Camera, Upload, AlertCircle, CheckCircle, Info } from "lucide-react";

interface SkinObservation {
  observation_id: string;
  timestamp: string;
  observations: {
    skin_tone?: { value: string; confidence: number };
    moisture_level?: { value: string; confidence: number };
    texture_analysis?: {
      smoothness: number;
      roughness: number;
      confidence: number;
    };
  };
  notes: string;
  disclaimer: string;
}

export default function SkinObservation() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [observation, setObservation] = useState<SkinObservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setError(null);
      setObservation(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/youcam/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: image,
          analysis_type: "observation",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setObservation(data.observation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                Skin Observation Module — Important Boundaries
              </h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                This module provides <strong>descriptive image observations only</strong>. It does NOT:
                diagnose medical conditions, predict disease, recommend treatments, or establish causality
                with environmental conditions. Observations are image-based descriptive data, not medical
                assessments. For medical concerns, consult a qualified healthcare professional.
              </p>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="mt-2 text-xs text-amber-700 underline hover:text-amber-900"
              >
                I understand — Hide this message
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Image Upload */}
        <div className="space-y-4">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {!image ? (
              <div className="space-y-4">
                <Camera size={48} className="mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a skin image for observation analysis
                  </p>
                  <p className="text-xs text-gray-500">
                    Max 10MB • JPG, PNG, or WebP
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload size={16} />
                  Select Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={image}
                  alt="Uploaded skin"
                  className="max-w-full h-auto rounded-lg mx-auto"
                  style={{ maxHeight: "400px" }}
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={analyzing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Image"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-900">Analysis Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Observations */}
        <div className="space-y-4">
          {observation ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <h3 className="font-semibold">Observation Complete</h3>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-gray-500">
                  {new Date(observation.timestamp).toLocaleString()}
                </div>

                {observation.observations.skin_tone && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="text-sm font-medium text-gray-700">Skin Tone</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {observation.observations.skin_tone.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {(observation.observations.skin_tone.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                {observation.observations.moisture_level && (
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <div className="text-sm font-medium text-gray-700">Moisture Level</div>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {observation.observations.moisture_level.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {(observation.observations.moisture_level.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                {observation.observations.texture_analysis && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Texture Analysis</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Smoothness:</span>
                        <span className="font-semibold">
                          {observation.observations.texture_analysis.smoothness.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Roughness:</span>
                        <span className="font-semibold">
                          {observation.observations.texture_analysis.roughness.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Confidence: {(observation.observations.texture_analysis.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )}

                {observation.notes && (
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
                    <div className="text-sm text-gray-600">{observation.notes}</div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-700 underline">
                  Associate with Experiment (Optional)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Info size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">
                Upload an image and click "Analyze" to see observations
              </p>
            </div>
          )}

          {/* Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>Separation of Concerns:</strong>
                <ol className="mt-2 space-y-1 text-xs">
                  <li>1. IMAGE OBSERVATION (YouCam) — Descriptive analysis</li>
                  <li>2. PHYSICS SIMULATION (Dermatherm) — Computational modeling</li>
                  <li>3. MEDICAL INTERPRETATION — OUT OF SCOPE</li>
                </ol>
                <p className="mt-2 text-xs">
                  These three domains are <strong>SEPARATE</strong> and must not be confused.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
