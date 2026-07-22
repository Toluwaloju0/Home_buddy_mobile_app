'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../../lib/api';
import { nigeriaStates, statesWithLgas } from '../../../../../utils/stateList';
import SellerHeader from '../../../../components/SellerHeader';

const DRAFT_KEY = 'home_buddy_apartment_listing_draft_v1';
const DB_NAME = 'home_buddy_listing_drafts';
const DB_VERSION = 1;
const STORE_NAME = 'apartment_listing_files';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const steps = [
  { key: 'basics', label: 'Basics' },
  { key: 'location', label: 'Location' },
  { key: 'media', label: 'Media' },
  { key: 'documents', label: 'Documents' },
];

const apartmentTypes = [
  { label: 'Duplex', value: 'duplex' },
  { label: 'Flat', value: 'flat' },
  { label: 'Mini Flat', value: 'mini flat' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Bungalow', value: 'bunglow' },
];

const stateOptions = nigeriaStates.map((state) => ({
  label: state,
  value: state === 'Federal Capital Territory' ? 'Fct' : state,
}));

const initialForm = {
  title: '',
  property_type: 'flat',
  price: '',
  is_negotiable: true,
  size_square_meters: '',
  description: '',
  year_built: '',
  number_of_bedrooms: '',
  number_of_bathrooms: '',
  other_amenities: [],
  state: '',
  l_g_a: '',
  street: '',
  building_no: '',
  house_no: '',
};

const singleMediaFields = [
  { key: 'exterior_image', label: 'Exterior image', required: true },
  { key: 'sitting_room_image', label: 'Sitting room image', required: true },
  { key: 'kitchen_image', label: 'Kitchen image', required: true },
  { key: 'garden_image', label: 'Garden image', amenity: 'garden' },
  { key: 'gym_image', label: 'Gym image', amenity: 'gym' },
];

const documentFields = [
  { key: 'proof_of_ownership', label: 'Proof of ownership', required: true },
  { key: 'tax_clearance_certificate', label: 'Tax clearance certificate' },
  { key: 'approved_building_plan', label: 'Approved building plan' },
  { key: 'occupancy_permit', label: 'Occupancy permit' },
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

function makeIndexedKeys(prefix, count) {
  return Array.from({ length: Number(count) || 0 }, (_, index) => `${prefix}_${index}`);
}

export default function ApartmentListingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [estateDueKeys, setEstateDueKeys] = useState(['estate_dues_receipt_0']);
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
          setForm({ ...initialForm, ...(parsedDraft.form || {}) });
          setActiveStep(Number.isInteger(parsedDraft.activeStep) ? parsedDraft.activeStep : 0);
          setFileNames(parsedDraft.fileNames || {});
          setEstateDueKeys(parsedDraft.estateDueKeys?.length ? parsedDraft.estateDueKeys : ['estate_dues_receipt_0']);
        }

        const draft = savedDraft ? JSON.parse(savedDraft) : {};
        const bedroomKeys = makeIndexedKeys('bedroom_images', draft.form?.number_of_bedrooms || initialForm.number_of_bedrooms);
        const bathroomKeys = makeIndexedKeys('bathroom_images', draft.form?.number_of_bathrooms || initialForm.number_of_bathrooms);
        const allKeys = [
          ...singleMediaFields.map((field) => field.key),
          ...documentFields.map((field) => field.key),
          'home_video',
          ...(draft.estateDueKeys?.length ? draft.estateDueKeys : ['estate_dues_receipt_0']),
          ...bedroomKeys,
          ...bathroomKeys,
        ];

        const restoredFiles = {};
        for (const key of allKeys) {
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
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        form,
        activeStep,
        fileNames,
        estateDueKeys,
        savedAt: new Date().toISOString(),
      }));
      setDraftStatus('Draft saved');
    }, 900);

    return () => window.clearTimeout(timer);
  }, [form, activeStep, fileNames, estateDueKeys]);

  const activeStepKey = steps[activeStep]?.key || steps[0].key;
  const bedrooms = Number(form.number_of_bedrooms) || 0;
  const bathrooms = Number(form.number_of_bathrooms) || 0;
  const hasGarden = form.other_amenities.includes('garden');
  const hasGym = form.other_amenities.includes('gym');

  const selectedStateLgas = useMemo(() => {
    const stateKey = form.state === 'Fct' ? 'Federal Capital Territory' : form.state;
    return statesWithLgas[stateKey] || [];
  }, [form.state]);

  const onFieldChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
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

  const onAmenityChange = (amenity) => (event) => {
    setForm((current) => {
      const amenities = new Set(current.other_amenities);
      if (event.target.checked) {
        amenities.add(amenity);
      } else {
        amenities.delete(amenity);
      }
      return { ...current, other_amenities: Array.from(amenities) };
    });
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

  const updateFile = async (fieldKey, file, options = {}) => {
    if (!file) return;

    const isVideo = options.type === 'video';
    const isDocument = options.type === 'document';
    const allowedImage = file.type?.startsWith('image/');
    const allowedVideo = file.type === 'video/mp4' || file.type === 'video/webm' || file.type?.startsWith('video/');
    const allowedDocument = file.type?.startsWith('image/') || file.type === 'application/pdf';

    if (isVideo && !allowedVideo) {
      setFeedback({ type: 'error', text: 'Apartment video must be MP4 or WEBM.' });
      return;
    }

    if (isDocument && !allowedDocument) {
      setFeedback({ type: 'error', text: 'Documents must be image or PDF files.' });
      return;
    }

    if (!isVideo && !isDocument && !allowedImage) {
      setFeedback({ type: 'error', text: 'Apartment media images must be image files.' });
      return;
    }

    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      setFeedback({ type: 'error', text: 'Images and documents must not exceed 5MB.' });
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      setFeedback({ type: 'error', text: 'Apartment video must not exceed 50MB.' });
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

  const addEstateDueReceipt = () => {
    setEstateDueKeys((current) => [...current, `estate_dues_receipt_${Date.now()}`]);
  };

  const removeEstateDueReceipt = async (key) => {
    if (estateDueKeys.length === 1) {
      await removeFile(key);
      return;
    }
    setEstateDueKeys((current) => current.filter((item) => item !== key));
    await removeFile(key);
  };

  const validateStep = (stepIndex = activeStep) => {
    if (stepIndex === 0) {
      if (
        !form.title.trim() || !form.property_type || !form.price.trim() ||
        !form.size_square_meters || !form.description.trim() ||
        !form.number_of_bedrooms || !form.number_of_bathrooms
      ) {
        return 'Complete the title, property type, price, size, description, bedrooms, and bathrooms.';
      }
      if (!normalizeInteger(form.price) || Number(normalizeInteger(form.price)) <= 0) {
        return 'Price must be a whole number greater than zero.';
      }
      if (!normalizeInteger(form.size_square_meters) || Number(normalizeInteger(form.size_square_meters)) <= 0) {
        return 'Apartment size must be a whole number greater than zero.';
      }
      if (form.year_built && (!normalizeInteger(form.year_built) || Number(normalizeInteger(form.year_built)) < 1800)) {
        return 'Year built must be a valid year.';
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
      const providedBedroomImages = Array.from({ length: bedrooms }).filter((_, index) => files[`bedroom_images_${index}`]?.file).length;
      if (providedBedroomImages > 0 && providedBedroomImages !== bedrooms) {
        return 'If bedroom images are provided, upload one image for each bedroom.';
      }

      const providedBathroomImages = Array.from({ length: bathrooms }).filter((_, index) => files[`bathroom_images_${index}`]?.file).length;
      if (providedBathroomImages > 0 && providedBathroomImages !== bathrooms) {
        return 'If bathroom images are provided, upload one image for each bathroom.';
      }
    }

    if (stepIndex === 3 && !files.proof_of_ownership?.file) {
      return 'Proof of ownership is required.';
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
      payload.append('property_type', form.property_type);
      payload.append('title', form.title.trim());
      payload.append('price', normalizeInteger(form.price));
      payload.append('state', form.state);
      payload.append('l_g_a', form.l_g_a);
      payload.append('street', form.street.trim());
      payload.append('building_no', normalizeInteger(form.building_no));
      payload.append('house_no', form.house_no ? normalizeInteger(form.house_no) : '0');
      payload.append('description', form.description.trim());
      if (form.year_built) payload.append('year_built', normalizeInteger(form.year_built));
      payload.append('number_of_bedrooms', String(bedrooms));
      payload.append('number_of_bathrooms', String(bathrooms));
      payload.append('size_square_meters', normalizeInteger(form.size_square_meters));
      form.other_amenities.forEach((amenity) => payload.append('other_amenities', amenity));
      payload.append('is_negotiable', form.is_negotiable ? 'true' : 'false');

      singleMediaFields.forEach((field) => {
        const file = files[field.key]?.file;
        if (file) payload.append(field.key, file);
      });
      if (files.home_video?.file) payload.append('home_video', files.home_video.file);
      for (let index = 0; index < bedrooms; index += 1) {
        const file = files[`bedroom_images_${index}`]?.file;
        if (file) payload.append('bedroom_images', file);
      }
      for (let index = 0; index < bathrooms; index += 1) {
        const file = files[`bathroom_images_${index}`]?.file;
        if (file) payload.append('bathroom_images', file);
      }
      documentFields.forEach((field) => {
        const file = files[field.key]?.file;
        if (file) payload.append(field.key, file);
      });
      estateDueKeys.forEach((key) => {
        const file = files[key]?.file;
        if (file) payload.append('estate_dues_receipt', file);
      });

      const response = await authFetch(`${API_BASE_URL}/seller/listings/apartment/submit`, {
        method: 'POST',
        body: payload,
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to submit the apartment listing. Please try again.' });
        setSubmitting(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.status) {
        localStorage.removeItem(DRAFT_KEY);
        await clearDraftFiles().catch(() => null);
        setFeedback({ type: 'success', text: data.message || 'Apartment listing submitted successfully.' });
        router.push('/seller/listings');
        return;
      }

      const validationMessage = Array.isArray(data?.detail)
        ? data.detail.map((item) => `${item.loc?.slice(-1)?.[0] || 'field'}: ${item.msg}`).join(', ')
        : null;
      setFeedback({ type: 'error', text: data?.message || validationMessage || 'Failed to submit apartment listing.' });
    } catch (error) {
      console.error('Apartment listing submit failed:', error);
      setFeedback({ type: 'error', text: 'Failed to submit apartment listing.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFileCard = (key, label, options = {}) => {
    const item = files[key];
    return (
      <label key={key} className="shop-upload-card">
        <span className="media-upload-title">
          {label}
          {options.required ? <em>Required</em> : <small>Optional</small>}
        </span>
        {options.hint ? <span className="media-upload-hint">{options.hint}</span> : null}
        <input
          type="file"
          accept={options.accept || 'image/jpeg,image/png,image/jpg,image/webp'}
          onChange={(event) => updateFile(key, event.target.files?.[0], options)}
        />
        {item ? (
          <div className="shop-file-preview">
            {item.preview ? <img src={item.preview} alt="" /> : <span>{item.name}</span>}
            <button type="button" onClick={() => removeFile(key)}>Remove</button>
          </div>
        ) : (
          <span className="media-upload-count">{fileNames[key] || 'Choose file'}</span>
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
          <p className="settings-kicker">Apartment listing workflow</p>
          <h1>Create an apartment listing</h1>
          <p className="form-subtitle">
            Add apartment details step by step. Your draft saves automatically while you type or upload files.
          </p>
          <div className="shop-draft-status">{draftStatus}</div>
        </section>

        <nav className="shop-wizard-steps" aria-label="Apartment listing steps">
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
                <span>Set the buyer-facing details for this apartment.</span>
              </div>
              <div className="listing-form-grid">
                <label className="field-item">
                  <span>Property Title</span>
                  <input value={form.title} onChange={onFieldChange('title')} placeholder="e.g. Spacious 3 bedroom flat" />
                </label>
                <label className="field-item">
                  <span>Property Type</span>
                  <select value={form.property_type} onChange={onFieldChange('property_type')}>
                    {apartmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>
                <label className="field-item">
                  <span>Price (N)</span>
                  <input value={form.price} onChange={onPriceChange} inputMode="numeric" placeholder="e.g. 15,000,000" />
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
                  <span>Apartment Size</span>
                  <input value={form.size_square_meters} onChange={onIntegerFieldChange('size_square_meters')} inputMode="numeric" placeholder="e.g. 180" />
                </label>
                <label className="field-item">
                  <span>Year Built</span>
                  <input value={form.year_built} onChange={onIntegerFieldChange('year_built')} inputMode="numeric" placeholder="Optional" />
                </label>
                <label className="field-item">
                  <span>Number of Bedrooms</span>
                  <input value={form.number_of_bedrooms} onChange={onIntegerFieldChange('number_of_bedrooms')} inputMode="numeric" placeholder="e.g. 3" />
                </label>
                <label className="field-item">
                  <span>Number of Bathrooms</span>
                  <input value={form.number_of_bathrooms} onChange={onIntegerFieldChange('number_of_bathrooms')} inputMode="numeric" placeholder="e.g. 4" />
                </label>
                <div className="field-item">
                  <span>Other Amenities</span>
                  <label className="field-note">
                    <input type="checkbox" checked={hasGarden} onChange={onAmenityChange('garden')} />
                    Garden
                  </label>
                  <label className="field-note">
                    <input type="checkbox" checked={hasGym} onChange={onAmenityChange('gym')} />
                    Gym
                  </label>
                </div>
                <label className="field-item field-item--wide">
                  <span>Description</span>
                  <textarea value={form.description} onChange={onFieldChange('description')} rows={6} placeholder="Describe the apartment, condition, layout, nearby landmarks, and title details." />
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
                  <span>House No</span>
                  <input value={form.house_no} onChange={onIntegerFieldChange('house_no')} inputMode="numeric" placeholder="Optional" />
                </label>
              </div>
            </>
          ) : null}

          {activeStepKey === 'media' ? (
            <>
              <div className="settings-section-title">
                <h2>Apartment media</h2>
                <span>Upload a video, images, or both. Bedroom and bathroom image groups must match their counts when used.</span>
              </div>
              <div className="media-grid shop-upload-grid">
                {renderFileCard('home_video', 'Apartment video', {
                  type: 'video',
                  accept: 'video/mp4,video/webm',
                  hint: 'Optional MP4 or WEBM',
                })}
                {singleMediaFields
                  .filter((field) => !field.amenity || form.other_amenities.includes(field.amenity))
                  .map((field) => renderFileCard(field.key, field.label, {
                    hint: 'Optional image',
                  }))}
                {Array.from({ length: bedrooms }, (_, index) => renderFileCard(
                  `bedroom_images_${index}`,
                  `Bedroom ${index + 1} image`,
                  { hint: 'Optional, but all bedrooms need one image if this group is used' },
                ))}
                {Array.from({ length: bathrooms }, (_, index) => renderFileCard(
                  `bathroom_images_${index}`,
                  `Bathroom ${index + 1} image`,
                  { hint: 'Optional, but all bathrooms need one image if this group is used' },
                ))}
              </div>
            </>
          ) : null}

          {activeStepKey === 'documents' ? (
            <>
              <div className="settings-section-title">
                <h2>Verification documents</h2>
                <span>Proof of ownership is required. Other documents are optional.</span>
              </div>
              <div className="shop-media-rule">
                Media uploaded here for ownership verification will only be seen by admins for verification purposes.
              </div>
              <div className="document-grid shop-upload-grid">
                {documentFields.map((field) => renderFileCard(field.key, field.label, {
                  required: field.required,
                  type: 'document',
                  accept: 'image/jpeg,image/png,image/jpg,image/webp,application/pdf',
                }))}
              </div>
              <div className="shop-media-rule">
                Estate dues receipt can include multiple files.
              </div>
              <div className="document-grid shop-upload-grid">
                {estateDueKeys.map((key, index) => (
                  <div key={key} className="shop-upload-card">
                    {renderFileCard(key, `Estate dues receipt ${index + 1}`, {
                      type: 'document',
                      accept: 'image/jpeg,image/png,image/jpg,image/webp,application/pdf',
                    })}
                    <button type="button" className="btn-secondary" onClick={() => removeEstateDueReceipt(key)}>
                      Remove receipt
                    </button>
                  </div>
                ))}
              </div>
              <div className="form-actions listing-form-actions">
                <button type="button" className="btn-secondary" onClick={addEstateDueReceipt}>
                  + Add estate dues receipt
                </button>
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
              {submitting ? 'Submitting...' : 'Submit Apartment Listing'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
