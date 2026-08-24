# YouCam API Integration — Dermatherm

## Overview

The YouCam API (Perfect Corp) has been integrated as an **optional, separate module** for skin observation and image analysis. This integration follows the strict boundaries outlined in the project requirements.

---

## Critical Boundaries

### What YouCam DOES:
- ✅ Provides descriptive image observations
- ✅ Analyzes skin tone, moisture level, texture
- ✅ Identifies temperature zones (relative, not absolute)
- ✅ Generates observational data

### What YouCam DOES NOT:
- ❌ Diagnose medical conditions
- ❌ Predict disease
- ❌ Recommend treatments
- ❌ Establish causality with environmental conditions
- ❌ Replace medical examination
- ❌ Validate computational models

### Separation of Concerns:

```
┌─────────────────────────────────────────────┐
│ 1. IMAGE OBSERVATION (YouCam)              │
│    - Descriptive image analysis            │
│    - Observational data only               │
└─────────────────────────────────────────────┘
                    ↓ (SEPARATE)
┌─────────────────────────────────────────────┐
│ 2. PHYSICS SIMULATION (Dermatherm Solver)  │
│    - Computational modeling                │
│    - Numerical predictions                 │
└─────────────────────────────────────────────┘
                    ↓ (SEPARATE)
┌─────────────────────────────────────────────┐
│ 3. MEDICAL INTERPRETATION                  │
│    - OUT OF SCOPE                          │
│    - Consult healthcare professional       │
└─────────────────────────────────────────────┘
```

These three domains are **COMPLETELY SEPARATE** and must never be confused.

---

## API Configuration

### Your API Key:
```
sk-qHO--j9ZYvrOq0Nrzo5L0czdaZKszzIWQYZD5FFfQ-GvBy3KpYiwR0FpA2aT7n4s
```

### Environment Setup:

1. **Backend .env file:**
```bash
YOUCAM_API_KEY=sk-qHO--j9ZYvrOq0Nrzo5L0czdaZKszzIWQYZD5FFfQ-GvBy3KpYiwR0FpA2aT7n4s
```

2. **Already configured in `.env.example`**

---

## Implementation Details

### Backend Files Created:

1. **`backend/src/services/youcam.ts`** — YouCam service integration
   - `analyzeSkinImage()` — Main analysis function
   - `associateObservationWithExperiment()` — Link observations to experiments (record-keeping only)
   - `checkYouCamStatus()` — Service health check
   - Full disclaimer enforcement

2. **`backend/src/routes/youcam.ts`** — API endpoints
   - `GET /api/youcam/status` — Check service availability
   - `GET /api/youcam/features` — List supported features
   - `POST /api/youcam/analyze` — Analyze skin image
   - `POST /api/youcam/associate` — Associate with experiment (optional)
   - `GET /api/youcam/disclaimer` — Get full disclaimer text

### Frontend Component Created:

**`src/components/SkinObservation.tsx`** — Skin observation UI
- Image upload interface
- Analysis trigger
- Results display with confidence scores
- Prominent disclaimer banner
- Clear separation messaging

---

## API Endpoints

### 1. Check Service Status
```http
GET /api/youcam/status
```

Response:
```json
{
  "available": true,
  "configured": true,
  "message": "YouCam service operational"
}
```

### 2. Analyze Image
```http
POST /api/youcam/analyze
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "analysis_type": "observation"
}
```

Response:
```json
{
  "observation": {
    "observation_id": "OBS-1234567890-5678",
    "timestamp": "2024-08-23T23:00:00.000Z",
    "observations": {
      "skin_tone": {
        "value": "medium",
        "confidence": 0.87
      },
      "moisture_level": {
        "value": "normal",
        "confidence": 0.92
      },
      "texture_analysis": {
        "smoothness": 0.75,
        "roughness": 0.25,
        "confidence": 0.85
      }
    },
    "notes": "Skin tone observed: medium. Moisture level: normal. Texture analysis: smoothness 0.75, roughness 0.25.",
    "disclaimer": "..."
  },
  "disclaimer": "FULL DISCLAIMER TEXT"
}
```

### 3. Associate with Experiment (Optional)
```http
POST /api/youcam/associate
Content-Type: application/json

{
  "observation_id": "OBS-...",
  "experiment_id": "EXP-2024-001",
  "climate_conditions": {
    "T_inf": 42,
    "RH_inf": 85,
    "duration_minutes": 30
  }
}
```

**CRITICAL:** This creates a record-keeping link ONLY. It does NOT establish:
- Causal relationships
- Model validation
- Medical interpretation

### 4. Get Disclaimer
```http
GET /api/youcam/disclaimer
```

---

## Usage in Frontend

### Accessing the Module

1. Open http://localhost:3000/
2. Click **"Skin Observation"** in navigation
3. You'll see the disclaimer banner
4. Upload an image
5. Click "Analyze Image"
6. View observational results

### UI Features

- **Disclaimer Banner:** Prominent warning about boundaries
- **Image Upload:** Drag & drop or click to select
- **Validation:** Size and format checking
- **Results Display:** 
  - Skin tone with confidence
  - Moisture level with confidence
  - Texture analysis (smoothness, roughness)
  - Temperature zones (if available)
- **Separation Message:** Clear explanation of three separate domains

---

## Integration with Experiments (Optional)

If you want to **record** (not causally link) an observation with an experiment:

```typescript
// After running an experiment and taking a skin observation
const association = await fetch('/api/youcam/associate', {
  method: 'POST',
  body: JSON.stringify({
    observation_id: observation.observation_id,
    experiment_id: experiment.id,
    climate_conditions: {
      T_inf: 42,
      RH_inf: 85,
      duration_minutes: 30
    }
  })
});
```

The response includes:
```
relationship_note: "This association is for RECORD-KEEPING ONLY. 
It does NOT establish causal relationships..."
```

---

## Disclaimer (Always Displayed)

```
SKIN OBSERVATION DISCLAIMER:

This analysis provides DESCRIPTIVE image observations only. It does NOT:
- Diagnose medical conditions
- Predict disease
- Recommend treatments
- Establish causality with environmental conditions
- Replace medical examination
- Validate computational models

Observations are:
- Image-based descriptive data
- Subject to imaging conditions
- Not medical assessments
- Not predictive of health outcomes

Any association with simulation experiments is for RECORD-KEEPING ONLY.
No causal inference is implied or supported.

For medical concerns, consult a qualified healthcare professional.
```

---

## Testing

### 1. Check Service Status
```bash
curl http://localhost:8000/api/youcam/status
```

### 2. Test Analysis (with image)
```bash
# Prepare base64 encoded image
IMAGE_BASE64=$(base64 -w 0 test_image.jpg)

curl -X POST http://localhost:8000/api/youcam/analyze \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"data:image/jpeg;base64,$IMAGE_BASE64\"}"
```

### 3. Frontend Test
1. Open http://localhost:3000/
2. Navigate to "Skin Observation"
3. Upload test image
4. Click "Analyze"
5. Verify results display

---

## API Key Security

✅ **Correct:**
- API key in `.env` file
- `.env` in `.gitignore`
- Environment variable in backend
- Never in frontend code

❌ **Never:**
- Commit API key to repository
- Expose in frontend code
- Share publicly

---

## Troubleshooting

### "YouCam integration not configured"
- Check `.env` file exists in backend/
- Verify `YOUCAM_API_KEY` is set
- Restart backend server

### "Analysis failed"
- Check image size (max 10MB)
- Verify image format (JPG, PNG, WebP)
- Check YouCam API service status
- Review backend logs

### "Service unavailable"
- YouCam API might be down
- Check network connectivity
- Verify API key is valid

---

## Important Notes

1. **Optional Module:** The entire Dermatherm application works **without** YouCam. This is a completely optional add-on.

2. **No Medical Claims:** All UI elements include disclaimers. Never present observations as medical facts.

3. **Separation:** Keep observations separate from physics simulation results.

4. **Record-Keeping:** Associations with experiments are for **organization only**, not for establishing causality.

5. **Healthcare Professional:** Always direct medical questions to qualified professionals.

---

## Future Enhancements

Potential additions (if needed):
- Batch image analysis
- Historical observation tracking
- Comparison between observations (descriptive only)
- Export observations as structured data
- Integration with experiment reports (as separate section)

---

## Summary

✅ **What's Implemented:**
- Complete YouCam API integration
- Backend service with validation
- REST API endpoints
- Frontend UI component
- Disclaimer enforcement
- Optional experiment association
- Clear boundary messaging

✅ **What's Protected:**
- No medical claims
- No diagnostic language
- No causal inference
- Clear separation from physics
- Healthcare professional referral

**The YouCam integration is production-ready and scientifically honest.**
