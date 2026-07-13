'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../../lib/api';
import { nigeriaStates, statesWithLgas } from '../../../../../utils/stateList';
import SellerHeader from '../../../../components/SellerHeader';

const DRAFT_KEY = 'home_buddy_land_listing_draft_v1';
const DB_NAME = 'home_buddy_listing_drafts';
const DB_VERSION = 1;
const STORE_NAME = 'land_listing_files';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const steps = [
  { key: 'basics', label: 'Basics' },
  { key: 'location', label: 'Location' },
  { key: 'media', label: 'Media' },
];

const stateOptions = nigeriaStates.map((state) => ({
  label: state,
  value: state === 'Federal Capital Territory' ? 'Fct' : state,
}));

const initialForm = {
  title: '',
  property_type: 'land',
  price: '',
  is_negotiable: true,
  size_square_meters: '',
  description: '',
  state: '',
  l_g_a: '',
  street: '',
  building_no: '',
};

const fileFields = [
  {
    key: 'land_image',
    label: 'Land image',
    accept: 'image/jpeg,image/png,image/jpg,image/webp',
    type: 'image',
    helper: 'Accepted with or without a video',
  },
  {
    key: 'land_video',
    label: 'Land video',
    accept: 'video/mp4,video/webm',
    type: 'video',
    helper: 'Accepted with or without an image',
  },
  {
    key: 'proof_of_ownership',
    label: 'Proof of ownership',
    accept: 'image/jpeg,image/png,image/jpg,image/webp,application/pdf',
    type: 'document',
    helper: 'Required image or PDF',
    required: true,
  },
];

function openDraftDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDraftFile(key, file) {
  const db = await openDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(file, key);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function getDraftFile(key) {
  const db = await openDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function deleteDraftFile(key) {
  const db = await openDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(key);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function clearDraftFiles() {
  const db = await openDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function fileToItem(file) {
  if (!file) return null;
  return {
    file,
    name: file.name,
    preview: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
  };
}

function normalizeInteger(value) {
  return String(value || '').replace(/[,\s]/g, '').replace(/\D/g, '');
}

export default function LandListingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [draftStatus, setDraftStatus] = useState('Draft ready');
  const [submitting, setSubmitting] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
      if (!mounted) return;

      if (!response) {
        setLoadingUser(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.payload) {
        setUser(data.payload);
      } else {
        redirectToLogin();
      }
      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function restoreDraft() {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setForm({ ...initialForm, ...(parsedDraft.form || {}), property_type: 'land' });
          setActiveStep(Number.isInteger(parsedDraft.activeStep) ? parsedDraft.activeStep : 0);
          setFileNames(parsedDraft.fileNames || {});
        }

        const restoredFiles = {};
        for (const field of fileFields) {
          const storedFile = await getDraftFile(field.key).catch(() => null);
          if (storedFile) restoredFiles[field.key] = fileToItem(storedFile);
        }

        if (mounted && Object.keys(restoredFiles).length) {
          setFiles(restoredFiles);
          setFileNames((current) => {
            const next = { ...current };
            Object.entries(restoredFiles).forEach(([key, item]) => {
              next[key] = item.name;
            });
            return next;
          });
        }
      } finally {
        if (mounted) hydratedRef.current = true;
      }
    }

    restoreDraft();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(files).forEach((item) => {
        if (item?.preview) URL.revokeObjectURL(item.preview);
      });
    };
  }, [files]);

  useEffect(() => {
    if (!hydratedRef.current) return undefined;

    setDraftStatus('Saving draft...');
    const timer = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        form: { ...form, property_type: 'land' },
        activeStep,
        fileNames,
        savedAt: new Date().toISOString(),
      }));
      setDraftStatus('Draft saved');
    }, 900);

    return () => window.clearTimeout(timer);
  }, [form, activeStep, fileNames]);

  const activeStepKey = steps[activeStep]?.key || steps[0].key;

  const selectedStateLgas = useMemo(() => {
    const stateKey = form.state === 'Fct' ? 'Federal Capital Territory' : form.state;
    return statesWithLgas[stateKey] || [];
  }, [form.state]);

  const onFieldChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'property_type' ? 'land' : event.target.value,
    }));
    setFeedback(null);
  };

  const onPriceChange = (event) => {
    setForm((current) => ({ ...current, price: event.target.value }));
    setFeedback(null);
  };

  const onIntegerFieldChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: normalizeInteger(event.target.value) }));
    setFeedback(null);
  };

  const onStateChange = (event) => {
    const nextState = event.target.value;
    const stateKey = nextState === 'Fct' ? 'Federal Capital Territory' : nextState;
    const nextLgas = statesWithLgas[stateKey] || [];

    setForm((current) => ({
      ...current,
      state: nextState,
      l_g_a: nextLgas.includes(current.l_g_a) ? current.l_g_a : '',
    }));
    setFeedback(null);
  };

  const updateFile = async (fieldKey, file) => {
    if (!file) return;

    const field = fileFields.find((item) => item.key === fieldKey);
    const isImage = field?.type === 'image';
    const isVideo = field?.type === 'video';
    const isDocument = field?.type === 'document';
    const allowedImage = file.type?.startsWith('image/');
    const allowedVideo = file.type === 'video/mp4' || file.type === 'video/webm' || file.type?.startsWith('video/');
    const allowedDocument = file.type?.startsWith('image/') || file.type === 'application/pdf';

    if (isImage && !allowedImage) {
      setFeedback({ type: 'error', text: 'Land image must be an image file.' });
      return;
    }

    if (isVideo && !allowedVideo) {
      setFeedback({ type: 'error', text: 'Land video must be MP4 or WEBM.' });
      return;
    }

    if (isDocument && !allowedDocument) {
      setFeedback({ type: 'error', text: 'Proof of ownership must be an image or PDF file.' });
      return;
    }

    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      setFeedback({ type: 'error', text: 'Images and documents must not exceed 5MB.' });
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      setFeedback({ type: 'error', text: 'Land video must not exceed 50MB.' });
      return;
    }

    setFiles((current) => {
      if (current[fieldKey]?.preview) URL.revokeObjectURL(current[fieldKey].preview);
      return { ...current, [fieldKey]: fileToItem(file) };
    });
    setFileNames((current) => ({ ...current, [fieldKey]: file.name }));
    setFeedback(null);
    setDraftStatus('Saving file...');

    try {
      await saveDraftFile(fieldKey, file);
      setDraftStatus('Draft saved');
    } catch (error) {
      console.error('Unable to save draft file:', error);
      setDraftStatus('File selected');
    }
  };

  const removeFile = async (fieldKey) => {
    setFiles((current) => {
      if (current[fieldKey]?.preview) URL.revokeObjectURL(current[fieldKey].preview);
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
    setFileNames((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
    await deleteDraftFile(fieldKey).catch(() => null);
  };

  const validateStep = (stepIndex = activeStep) => {
    if (stepIndex === 0) {
      if (!form.title.trim() || !form.price.trim() || !form.size_square_meters.trim() || !form.description.trim()) {
        return 'Complete the title, price, land size, and description.';
      }
      const normalizedPrice = normalizeInteger(form.price);
      if (!normalizedPrice || Number(normalizedPrice) <= 0) {
        return 'Price must be a whole number greater than zero.';
      }
    }

    if (stepIndex === 1) {
      if (!form.state || !form.l_g_a || !form.street.trim() || !form.building_no) {
        return 'Complete the state, government area, street, and building number.';
      }
      if (!normalizeInteger(form.building_no) || Number(normalizeInteger(form.building_no)) <= 0) {
        return 'Building number must be a whole number greater than zero.';
      }
    }

    if (stepIndex === 2) {
      if (!files.land_image?.file && !files.land_video?.file) {
        return 'Upload at least one land image or land video.';
      }
      if (!files.proof_of_ownership?.file) {
        return 'Proof of ownership is required.';
      }
    }

    return null;
  };

  const canAccessStep = (stepIndex) => {
    for (let index = 0; index < stepIndex; index += 1) {
      if (validateStep(index)) return false;
    }
    return true;
  };

  const goToStep = (stepIndex) => {
    if (!canAccessStep(stepIndex)) {
      setFeedback({ type: 'error', text: 'Complete the previous step before continuing.' });
      return;
    }
    setFeedback(null);
    setActiveStep(stepIndex);
  };

  const goNext = () => {
    const message = validateStep();
    if (message) {
      setFeedback({ type: 'error', text: message });
      return;
    }
    setFeedback(null);
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setFeedback(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const submitListing = async (event) => {
    event.preventDefault();

    for (let index = 0; index < steps.length; index += 1) {
      const message = validateStep(index);
      if (message) {
        setActiveStep(index);
        setFeedback({ type: 'error', text: message });
        return;
      }
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = new FormData();
      payload.append('property_type', 'land');
      payload.append('title', form.title.trim());
      payload.append('price', normalizeInteger(form.price));
      payload.append('description', form.description.trim());
      payload.append('state', form.state);
      payload.append('l_g_a', form.l_g_a);
      payload.append('street', form.street.trim());
      payload.append('building_no', normalizeInteger(form.building_no));
      payload.append('size_square_meters', form.size_square_meters.trim());
      payload.append('is_negotiable', form.is_negotiable ? 'true' : 'false');

      fileFields.forEach((field) => {
        const file = files[field.key]?.file;
        if (file) payload.append(field.key, file);
      });

      const response = await authFetch(`${API_BASE_URL}/seller/listings/land/submit`, {
        method: 'POST',
        body: payload,
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to submit the land listing. Please try again.' });
        setSubmitting(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.status) {
        localStorage.removeItem(DRAFT_KEY);
        await clearDraftFiles().catch(() => null);
        setFeedback({ type: 'success', text: data.message || 'Land listing submitted successfully.' });
        router.push('/seller/listings');
        return;
      }

      const validationMessage = Array.isArray(data?.detail)
        ? data.detail.map((item) => `${item.loc?.slice(-1)?.[0] || 'field'}: ${item.msg}`).join(', ')
        : null;
      setFeedback({ type: 'error', text: data?.message || validationMessage || 'Failed to submit land listing.' });
    } catch (error) {
      console.error('Land listing submit failed:', error);
      setFeedback({ type: 'error', text: 'Failed to submit land listing.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFileCard = (field) => {
    const item = files[field.key];
    return (
      <label key={field.key} className="shop-upload-card">
        <span className="media-upload-title">
          {field.label}
          {field.required ? <em>Required</em> : <small>Optional</small>}
        </span>
        <span className="media-upload-hint">{field.helper}</span>
        <input
          type="file"
          accept={field.accept}
          onChange={(event) => updateFile(field.key, event.target.files?.[0])}
        />
        {item ? (
          <div className="shop-file-preview">
            {item.preview ? <img src={item.preview} alt="" /> : <span>{item.name}</span>}
            <button type="button" onClick={() => removeFile(field.key)}>Remove</button>
          </div>
        ) : (
          <span className="media-upload-count">{fileNames[field.key] || 'Choose file'}</span>
        )}
      </label>
    );
  };

  return (
    <main className="page-shell seller-page-shell">
      <SellerHeader user={user} loadingUser={loadingUser} />

      <form className="listing-form shop-wizard-form" onSubmit={submitListing}>
        <section className="shop-wizard-hero">
          <button type="button" className="back-button back-button--hero" onClick={() => router.push('/seller/listings/new')}>
            &larr; Back
          </button>
          <p className="settings-kicker">Land listing workflow</p>
          <h1>Create a land listing</h1>
          <p className="form-subtitle">
            Add the land details step by step. Your draft saves automatically while you type or upload files.
          </p>
          <div className="shop-draft-status">{draftStatus}</div>
        </section>

        <nav className="shop-wizard-steps" aria-label="Land listing steps">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step.key}
              className={index === activeStep ? 'is-active' : ''}
              onClick={() => goToStep(index)}
              disabled={!canAccessStep(index)}
            >
              <span>{index + 1}</span>
              {step.label}
            </button>
          ))}
        </nav>

        <section className="settings-card listing-section-card shop-wizard-card">
          {activeStepKey === 'basics' ? (
            <>
              <div className="settings-section-title">
                <h2>Basic information</h2>
                <span>Set the buyer-facing details for this land.</span>
              </div>
              <div className="listing-form-grid">
                <label className="field-item">
                  <span>Property Title</span>
                  <input value={form.title} onChange={onFieldChange('title')} placeholder="e.g. Dry land near express road" />
                </label>
                <label className="field-item">
                  <span>Property Type</span>
                  <input value="land" disabled />
                </label>
                <label className="field-item">
                  <span>Price (N)</span>
                  <input value={form.price} onChange={onPriceChange} inputMode="numeric" placeholder="e.g. 2,500,000" />
                </label>
                <label className="field-item">
                  <span>Price is negotiable</span>
                  <select
                    value={form.is_negotiable ? 'yes' : 'no'}
                    onChange={(event) => setForm((current) => ({ ...current, is_negotiable: event.target.value === 'yes' }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label className="field-item">
                  <span>Land Size</span>
                  <input value={form.size_square_meters} onChange={onFieldChange('size_square_meters')} placeholder="e.g. 648 sqm" />
                </label>
                <label className="field-item field-item--wide">
                  <span>Description</span>
                  <textarea value={form.description} onChange={onFieldChange('description')} rows={6} placeholder="Describe the land, access road, landmarks, topography, and title details." />
                </label>
              </div>
            </>
          ) : null}

          {activeStepKey === 'location' ? (
            <>
              <div className="settings-section-title">
                <h2>Location</h2>
                <span>Provide the address details needed for verification.</span>
              </div>
              <div className="listing-form-grid">
                <label className="field-item">
                  <span>State</span>
                  <select value={form.state} onChange={onStateChange}>
                    <option value="">Select state</option>
                    {stateOptions.map((state) => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                </label>
                <label className="field-item">
                  <span>Government Area</span>
                  <select value={form.l_g_a} onChange={onFieldChange('l_g_a')} disabled={!form.state}>
                    <option value="">{form.state ? 'Select government area' : 'Select state first'}</option>
                    {selectedStateLgas.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </label>
                <label className="field-item">
                  <span>Street</span>
                  <input value={form.street} onChange={onFieldChange('street')} placeholder="Street name" />
                </label>
                <label className="field-item">
                  <span>Building Number</span>
                  <input value={form.building_no} onChange={onIntegerFieldChange('building_no')} inputMode="numeric" placeholder="e.g. 14" />
                </label>
              </div>
            </>
          ) : null}

          {activeStepKey === 'media' ? (
            <>
              <div className="settings-section-title">
                <h2>Land media and ownership</h2>
                <span>Upload an image or video of the land, plus proof of ownership.</span>
              </div>
              <div className="shop-media-rule">
                At least one land image or video is required. Proof of ownership is also required.
              </div>
              <div className="media-grid shop-upload-grid">
                {fileFields.map(renderFileCard)}
              </div>
            </>
          ) : null}
        </section>

        {feedback ? (
          <div className={feedback.type === 'success' ? 'success-message' : 'error-message'}>
            {feedback.text}
          </div>
        ) : null}

        <div className="form-actions listing-form-actions shop-wizard-actions">
          <button type="button" className="btn-secondary" onClick={goBack} disabled={activeStep === 0 || submitting}>
            Previous
          </button>
          {activeStep < steps.length - 1 ? (
            <button type="button" className="btn-primary" onClick={goNext}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Land Listing'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
