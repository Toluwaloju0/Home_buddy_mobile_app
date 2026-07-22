'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../../lib/api';
import { nigeriaStates, statesWithLgas } from '../../../../../utils/stateList';
import SellerHeader from '../../../../components/SellerHeader';

const DRAFT_KEY = 'home_buddy_shop_listing_draft_v1';
const DB_NAME = 'home_buddy_listing_drafts';
const DB_VERSION = 1;
const STORE_NAME = 'shop_listing_files';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const steps = [
  { key: 'basics', label: 'Basics' },
  { key: 'location', label: 'Location' },
  { key: 'media', label: 'Shop Media' },
  { key: 'documents', label: 'Documents' },
];

const stateOptions = nigeriaStates.map((state) => ({
  label: state,
  value: state === 'Federal Capital Territory' ? 'Fct' : state,
}));

const initialForm = {
  title: '',
  property_type: 'shop',
  price: '',
  is_negotiable: true,
  size_square_meters: '',
  description: '',
  state: '',
  l_g_a: '',
  street: '',
  building_no: '',
  shop_no: '',
  bathroom: true,
};

const mediaFields = [
  {
    key: 'exterior_image',
    label: 'Exterior image',
    accept: 'image/jpeg,image/png,image/jpg,image/webp',
    kind: 'image',
    requiredLabel: 'Required with interior image',
  },
  {
    key: 'interior_image',
    label: 'Interior image',
    accept: 'image/jpeg,image/png,image/jpg,image/webp',
    kind: 'image',
    requiredLabel: 'Required with exterior image',
  },
  {
    key: 'exterior_video',
    label: 'Walk-through video',
    accept: 'video/mp4,video/webm',
    kind: 'video',
    requiredLabel: 'Alternative to both images',
  },
];

const documentFields = [
  { key: 'proof_of_ownership', label: 'Proof of ownership', required: true },
  { key: 'tax_clearance_certificate', label: 'Tax clearance certificate', required: false },
  { key: 'occupancy_permit', label: 'Occupancy permit', required: false },
  { key: 'structural_integrity_report', label: 'Structural integrity report', required: false },
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

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export default function ShopListingPage() {
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
          setForm({ ...initialForm, ...(parsedDraft.form || {}), property_type: 'shop' });
          setActiveStep(Number.isInteger(parsedDraft.activeStep) ? parsedDraft.activeStep : 0);
          setFileNames(parsedDraft.fileNames || {});
        }

        const restoredFiles = {};
        const allFileKeys = [...mediaFields, ...documentFields].map((field) => field.key);
        for (const key of allFileKeys) {
          const storedFile = await getDraftFile(key).catch(() => null);
          if (storedFile) restoredFiles[key] = fileToItem(storedFile);
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
      const draft = {
        form: { ...form, property_type: 'shop' },
        activeStep,
        fileNames,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftStatus('Draft saved');
    }, 900);

    return () => window.clearTimeout(timer);
  }, [form, activeStep, fileNames]);

  const activeStepKey = steps[activeStep]?.key || steps[0].key;

  const mediaIsValid = useMemo(() => {
    const hasBothImages = Boolean(files.exterior_image?.file && files.interior_image?.file);
    const hasVideo = Boolean(files.exterior_video?.file);
    return hasBothImages || hasVideo;
  }, [files]);

  const selectedStateLgas = useMemo(() => {
    const stateKey = form.state === 'Fct' ? 'Federal Capital Territory' : form.state;
    return statesWithLgas[stateKey] || [];
  }, [form.state]);

  const onFieldChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({
      ...current,
      [field]: field === 'property_type' ? 'shop' : value,
    }));
    setFeedback(null);
  };

  const onIntegerFieldChange = (field) => (event) => {
    const value = digitsOnly(event.target.value);
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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

  const updateFile = async (field, file) => {
    if (!file) return;

    const isDocument = documentFields.some((item) => item.key === field);
    const isVideo = field === 'exterior_video';
    const allowedDocument = file.type?.startsWith('image/') || file.type === 'application/pdf';
    const allowedImage = file.type?.startsWith('image/');
    const allowedVideo = file.type === 'video/mp4' || file.type === 'video/webm' || file.type?.startsWith('video/');

    if (isDocument && !allowedDocument) {
      setFeedback({ type: 'error', text: 'Documents must be an image or PDF file.' });
      return;
    }

    if (!isDocument && isVideo && !allowedVideo) {
      setFeedback({ type: 'error', text: 'The shop video must be MP4 or WEBM.' });
      return;
    }

    if (!isDocument && !isVideo && !allowedImage) {
      setFeedback({ type: 'error', text: 'Shop images must be image files.' });
      return;
    }

    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      setFeedback({ type: 'error', text: 'Images and documents must not exceed 5MB.' });
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      setFeedback({ type: 'error', text: 'The shop video must not exceed 50MB.' });
      return;
    }

    setFiles((current) => {
      if (current[field]?.preview) URL.revokeObjectURL(current[field].preview);
      return { ...current, [field]: fileToItem(file) };
    });
    setFileNames((current) => ({ ...current, [field]: file.name }));
    setFeedback(null);
    setDraftStatus('Saving file...');

    try {
      await saveDraftFile(field, file);
      setDraftStatus('Draft saved');
    } catch (error) {
      console.error('Unable to save draft file:', error);
      setDraftStatus('File selected');
    }
  };

  const removeFile = async (field) => {
    setFiles((current) => {
      if (current[field]?.preview) URL.revokeObjectURL(current[field].preview);
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFileNames((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    await deleteDraftFile(field).catch(() => null);
  };

  const validateStep = (stepIndex = activeStep) => {
    if (stepIndex === 0) {
      if (!form.title.trim() || !form.price || !form.size_square_meters.trim() || !form.description.trim()) {
        return 'Complete the title, price, shop size, and description.';
      }
      if (!Number.isInteger(Number(form.price)) || Number(form.price) <= 0) {
        return 'Price must be a whole number greater than zero.';
      }
    }

    if (stepIndex === 1) {
      if (!form.state || !form.l_g_a.trim() || !form.street.trim() || !form.building_no || !form.shop_no) {
        return 'Complete the state, government area, street, building number, and shop number.';
      }
      if (!Number.isInteger(Number(form.building_no)) || Number(form.building_no) <= 0) {
        return 'Building number must be a whole number greater than zero.';
      }
      if (!Number.isInteger(Number(form.shop_no)) || Number(form.shop_no) <= 0) {
        return 'Shop number must be a whole number greater than zero.';
      }
    }

    if (stepIndex === 2) {
      if (!mediaIsValid) {
        return 'Upload both exterior and interior images, or upload a shop video.';
      }
      if ((files.exterior_image || files.interior_image) && !(files.exterior_image && files.interior_image)) {
        return 'Exterior and interior images must be provided together.';
      }
    }

    if (stepIndex === 3 && !files.proof_of_ownership?.file) {
      return 'Proof of ownership is required.';
    }

    return null;
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
      payload.append('property_type', 'shop');
      payload.append('title', form.title.trim());
      payload.append('price', digitsOnly(form.price));
      payload.append('state', form.state);
      payload.append('l_g_a', form.l_g_a.trim());
      payload.append('street', form.street.trim());
      payload.append('building_no', digitsOnly(form.building_no));
      payload.append('shop_no', digitsOnly(form.shop_no));
      payload.append('description', form.description.trim());
      payload.append('bathroom', form.bathroom ? 'true' : 'false');
      payload.append('is_negotiable', form.is_negotiable ? 'true' : 'false');
      payload.append('size_square_meters', form.size_square_meters.trim());

      [...mediaFields, ...documentFields].forEach((field) => {
        const file = files[field.key]?.file;
        if (file) payload.append(field.key, file);
      });

      const response = await authFetch(`${API_BASE_URL}/seller/listings/shop/submit`, {
        method: 'POST',
        body: payload,
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to submit the shop listing. Please try again.' });
        setSubmitting(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.status) {
        localStorage.removeItem(DRAFT_KEY);
        await clearDraftFiles().catch(() => null);
        setFeedback({ type: 'success', text: data.message || 'Shop listing submitted successfully.' });
        router.push('/seller/listings');
        return;
      }

      const validationMessage = Array.isArray(data?.detail)
        ? data.detail.map((item) => `${item.loc?.slice(-1)?.[0] || 'field'}: ${item.msg}`).join(', ')
        : null;
      setFeedback({ type: 'error', text: data?.message || validationMessage || 'Failed to submit shop listing.' });
    } catch (error) {
      console.error('Shop listing submit failed:', error);
      setFeedback({ type: 'error', text: 'Failed to submit shop listing.' });
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
          {field.required || field.requiredLabel ? <em>{field.required ? 'Required' : field.requiredLabel}</em> : <small>Optional</small>}
        </span>
        <input
          type="file"
          accept={field.accept || 'image/*,application/pdf'}
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
          <p className="settings-kicker">Commercial listing workflow</p>
          <h1>Create a shop listing</h1>
          <p className="form-subtitle">
            Add the shop details step by step. Your draft saves automatically while you type or upload files.
          </p>
          <div className="shop-draft-status">{draftStatus}</div>
        </section>

        <nav className="shop-wizard-steps" aria-label="Shop listing steps">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step.key}
              className={index === activeStep ? 'is-active' : ''}
              onClick={() => setActiveStep(index)}
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
                <span>Set the buyer-facing details for this shop.</span>
              </div>
              <div className="listing-form-grid">
                <label className="field-item">
                  <span>Property Title</span>
                  <input value={form.title} onChange={onFieldChange('title')} placeholder="e.g. Front-facing shop in Lekki" />
                </label>
                <label className="field-item">
                  <span>Property Type</span>
                  <input value="shop" disabled />
                </label>
                <label className="field-item">
                  <span>Price (N)</span>
                  <input value={form.price} onChange={onIntegerFieldChange('price')} inputMode="numeric" placeholder="e.g. 2500000" />
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
                  <span>Shop Size</span>
                  <input value={form.size_square_meters} onChange={onFieldChange('size_square_meters')} placeholder="e.g. 32 sqm" />
                </label>
                <label className="field-item">
                  <span>Bathroom Available</span>
                  <select value={form.bathroom ? 'true' : 'false'} onChange={(event) => setForm((current) => ({ ...current, bathroom: event.target.value === 'true' }))}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
                <label className="field-item field-item--wide">
                  <span>Description</span>
                  <textarea value={form.description} onChange={onFieldChange('description')} rows={6} placeholder="Describe access, visibility, foot traffic, nearby landmarks, and shop condition." />
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
                <label className="field-item">
                  <span>Shop No</span>
                  <input value={form.shop_no} onChange={onIntegerFieldChange('shop_no')} inputMode="numeric" placeholder="e.g. 3" />
                </label>
              </div>
            </>
          ) : null}

          {activeStepKey === 'media' ? (
            <>
              <div className="settings-section-title">
                <h2>Shop media</h2>
                <span>Upload both shop images, or upload one video showing the interior and exterior.</span>
              </div>
              <div className="shop-media-rule">
                Video alone is accepted. If you choose images, both exterior and interior images are required.
              </div>
              <div className="media-grid shop-upload-grid">
                {mediaFields.map(renderFileCard)}
              </div>
            </>
          ) : null}

          {activeStepKey === 'documents' ? (
            <>
              <div className="settings-section-title">
                <h2>Ownership documents</h2>
                <span>Proof of ownership is required. Other supporting files can strengthen the claim.</span>
              </div>
              <div className="shop-media-rule">
                Media uploaded here for ownership verification will only be seen by admins for verification purposes.
              </div>
              <div className="document-grid shop-upload-grid">
                {documentFields.map(renderFileCard)}
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
              {submitting ? 'Submitting...' : 'Submit Shop Listing'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
