import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";

import {
  createCategory,
  createService,
  createVariant,
  deleteService,
  getAllServicesAdmin,
  reactivateService,
  updateCategory,
  updateService,
  updateVariant,
} from "../../services/BACKEND/adminServiceApi";

import "../../styles/services.css";

const ITEMS_PER_PAGE = 3;
const DEFAULT_SERVICE_DURATION = "01:00";

const MODAL_TYPES = {
  SERVICE: "service",
  MANAGE: "manage",
  CATEGORY: "category",
  VARIANT: "variant",
};

const formatDurationToInterval = (time) => {
  if (!time) return "00:00:00";
  const [h = "00", m = "00"] = String(time).split(":");
  return `${h}:${m}:00`;
};

const normalizeDurationForInput = (value) => {
  if (!value) return "";

  if (/^\d{2}:\d{2}$/.test(value)) return value;

  if (/^\d+$/.test(String(value))) {
    const totalMinutes = Number(value);
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  return "";
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "0";
  return amount.toLocaleString("en-PH");
};

const getFreshServiceFromMap = (service, servicesById) => {
  return servicesById.get(service.id) || service;
};

const ServiceCard = memo(function ServiceCard({
  service,
  togglingId,
  onEdit,
  onManage,
  onToggle,
}) {
  const isToggling = togglingId === service.id;
  const isLocked = service.hasBookings;

  return (
    <div className="service-card">
      {service.image_url && (
        <div className="service-image-wrapper">
          <img
            src={service.image_url}
            alt={service.name}
            className="service-image"
            loading="lazy"
          />
        </div>
      )}

      <div className="service-top">
        <div className="service-title">
          <h3>{service.name}</h3>

          <span
            className={service.is_active ? "status-active" : "status-inactive"}
          >
            {service.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="service-buttons">
          <button
            className="btn-secondary"
            disabled={isLocked}
            onClick={() => onEdit(service)}
          >
            Edit
          </button>

          <button className="btn-secondary" onClick={() => onManage(service)}>
            Manage
          </button>

          <button
            className="btn-danger"
            disabled={isLocked || isToggling}
            onClick={() => onToggle(service)}
          >
            {isLocked
              ? "Locked"
              : isToggling
                ? "Saving..."
                : service.is_active
                  ? "Deactivate"
                  : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
});

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? "active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
});

const ModalShell = memo(function ModalShell({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="premium-modal service-consistent-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
});

const Services = () => {
  const [modal, setModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();
  const objectUrlRef = useRef(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const servicesRes = await getAllServicesAdmin();
      return servicesRes?.data || servicesRes || [];
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const servicesById = useMemo(() => {
    return new Map(services.map((service) => [service.id, service]));
  }, [services]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE));
  }, [services.length]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return services.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [services, currentPage]);

  const invalidateServices = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
  }, [queryClient]);

  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: invalidateServices,
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, formData }) => updateService(id, formData),
    onSuccess: invalidateServices,
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: invalidateServices,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: invalidateServices,
  });

  const createVariantMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: invalidateServices,
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, payload }) => updateVariant(id, payload),
    onSuccess: invalidateServices,
  });

  const deactivateServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: invalidateServices,
  });

  const reactivateServiceMutation = useMutation({
    mutationFn: reactivateService,
    onSuccess: invalidateServices,
  });

  const clearPreviewObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    clearPreviewObjectUrl();
    setModal(null);
    setPreviewImage(null);
  }, [clearPreviewObjectUrl]);

  const openCreateServiceModal = useCallback(() => {
    clearPreviewObjectUrl();
    setPreviewImage(null);
    setModal({
      type: MODAL_TYPES.SERVICE,
      name: "",
      description: "",
      duration: DEFAULT_SERVICE_DURATION,
      image: null,
    });
  }, [clearPreviewObjectUrl]);

  const openEditServiceModal = useCallback(
    (service) => {
      clearPreviewObjectUrl();
      setPreviewImage(service.image_url || null);
      setModal({
        ...service,
        type: MODAL_TYPES.SERVICE,
        duration: normalizeDurationForInput(service.duration),
        image: null,
      });
    },
    [clearPreviewObjectUrl],
  );

  const openManageModal = useCallback(
    (service) => {
      const freshService = getFreshServiceFromMap(service, servicesById);

      clearPreviewObjectUrl();
      setPreviewImage(null);
      setModal({
        type: MODAL_TYPES.MANAGE,
        service: freshService,
      });
    },
    [clearPreviewObjectUrl, servicesById],
  );

  const openCategoryCreateModal = useCallback((serviceId) => {
    setModal({
      type: MODAL_TYPES.CATEGORY,
      service_id: serviceId,
      name: "",
    });
  }, []);

  const openCategoryEditModal = useCallback((category) => {
    setModal({
      ...category,
      type: MODAL_TYPES.CATEGORY,
    });
  }, []);

  const openVariantCreateModal = useCallback((categoryId) => {
    setModal({
      type: MODAL_TYPES.VARIANT,
      category_id: categoryId,
      body_part: "",
      size: "",
      price: "",
      downpayment: "",
      estimate_min: "",
      estimate_max: "",
    });
  }, []);

  const openVariantEditModal = useCallback((variant, categoryId) => {
    setModal({
      id: variant.id,
      type: MODAL_TYPES.VARIANT,
      category_id: categoryId,
      body_part: variant.body_part,
      size: variant.size,
      price: variant.price,
      downpayment: variant.downpayment,
      estimate_min: variant.estimate_min ?? "",
      estimate_max: variant.estimate_max ?? "",
    });
  }, []);

  const updateModalField = useCallback((field, value) => {
    setModal((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      clearPreviewObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;

      setModal((prev) => ({ ...prev, image: file }));
      setPreviewImage(objectUrl);
    },
    [clearPreviewObjectUrl],
  );

  const handleServiceSave = useCallback(async () => {
    if (!modal) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", modal.name || "");
      formData.append("description", modal.description || "");
      formData.append("duration", formatDurationToInterval(modal.duration));

      if (modal.image) {
        formData.append("file", modal.image);
      }

      if (modal.id) {
        if (modal.hasBookings) {
          alert("Cannot edit service with existing bookings.");
          return;
        }

        await updateServiceMutation.mutateAsync({
          id: modal.id,
          formData,
        });
      } else {
        await createServiceMutation.mutateAsync(formData);
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  }, [modal, createServiceMutation, updateServiceMutation, closeModal]);

  const handleCategorySave = useCallback(async () => {
    if (!modal) return;

    try {
      setSaving(true);

      if (modal.id) {
        await updateCategoryMutation.mutateAsync({
          id: modal.id,
          payload: { name: modal.name },
        });
      } else {
        await createCategoryMutation.mutateAsync({
          service_id: modal.service_id,
          name: modal.name,
        });
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  }, [modal, updateCategoryMutation, createCategoryMutation, closeModal]);

  const handleVariantSave = useCallback(async () => {
    if (!modal) return;

    try {
      setSaving(true);

      const estimateMin =
        modal.estimate_min === "" || modal.estimate_min === null
          ? null
          : Number(modal.estimate_min);

      const estimateMax =
        modal.estimate_max === "" || modal.estimate_max === null
          ? null
          : Number(modal.estimate_max);

      if (!modal.body_part?.trim()) {
        alert("Body part is required.");
        return;
      }

      if (modal.price === "" || Number(modal.price) < 0) {
        alert("Please enter a valid price.");
        return;
      }

      if (modal.downpayment === "" || Number(modal.downpayment) < 0) {
        alert("Please enter a valid downpayment.");
        return;
      }

      if (estimateMin !== null && Number.isNaN(estimateMin)) {
        alert("Estimate Min must be a valid number.");
        return;
      }

      if (estimateMax !== null && Number.isNaN(estimateMax)) {
        alert("Estimate Max must be a valid number.");
        return;
      }

      if (estimateMin !== null && estimateMin < 0) {
        alert("Estimate Min must be 0 or higher.");
        return;
      }

      if (estimateMax !== null && estimateMax < 0) {
        alert("Estimate Max must be 0 or higher.");
        return;
      }

      if (
        estimateMin !== null &&
        estimateMax !== null &&
        estimateMin > estimateMax
      ) {
        alert("Estimate Min cannot be greater than Estimate Max.");
        return;
      }

      const payload = {
        category_id: Number(modal.category_id || modal.categoryId),
        body_part: modal.body_part,
        size: modal.size || "",
        price: Number(modal.price),
        downpayment: Number(modal.downpayment || 0),
        estimate_min: estimateMin,
        estimate_max: estimateMax,
      };

      if (modal.id) {
        await updateVariantMutation.mutateAsync({
          id: modal.id,
          payload,
        });
      } else {
        await createVariantMutation.mutateAsync(payload);
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Failed to save variant.");
    } finally {
      setSaving(false);
    }
  }, [modal, updateVariantMutation, createVariantMutation, closeModal]);

  const handleToggleService = useCallback(
    async (service) => {
      try {
        if (service.hasBookings) {
          alert("Cannot deactivate service with existing bookings.");
          return;
        }

        setTogglingId(service.id);

        if (service.is_active) {
          await deactivateServiceMutation.mutateAsync(service.id);
        } else {
          await reactivateServiceMutation.mutateAsync(service.id);
        }
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.error || err?.message || "Failed to update service.");
      } finally {
        setTogglingId(null);
      }
    },
    [deactivateServiceMutation, reactivateServiceMutation],
  );

  const goToPage = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  const isAnyMutationPending =
    saving ||
    createServiceMutation.isPending ||
    updateServiceMutation.isPending ||
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    createVariantMutation.isPending ||
    updateVariantMutation.isPending;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    return () => {
      clearPreviewObjectUrl();
    };
  }, [clearPreviewObjectUrl]);

  useEffect(() => {
    if (!modal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal, closeModal]);

  const renderServiceModal = () => (
    <>
      <div className="modal-header-block">
        <span className="modal-badge">
          {modal?.id ? "Edit Entry" : "New Entry"}
        </span>
        <h2>{modal?.id ? "Edit Service" : "Create Service"}</h2>
        <p>
          Add a service with description, estimated duration, and a display
          image.
        </p>
      </div>

      <div className="modal-form-grid">
        <div className="field-group">
          <div className="form-label-row">
            <label className="field-label">Service Name</label>
            <span>{modal?.name?.length || 0}/100</span>
          </div>
          <input
            placeholder="Enter service name"
            value={modal?.name || ""}
            maxLength={100}
            onChange={(e) => updateModalField("name", e.target.value)}
          />
        </div>

        <div className="field-group">
          <div className="form-label-row">
            <label className="field-label">Description</label>
            <span>{modal?.description?.length || 0}/400</span>
          </div>
          <textarea
            placeholder="Write a short description"
            value={modal?.description || ""}
            maxLength={400}
            onChange={(e) => updateModalField("description", e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label">Duration</label>
            <input
              type="time"
              step="900"
              value={modal?.duration || DEFAULT_SERVICE_DURATION}
              onChange={(e) => updateModalField("duration", e.target.value)}
            />
          </div>

          <div className="field-group">
            <div className="form-label-row">
              <label className="field-label">Service Image</label>
              <span>1 file</span>
            </div>

            <label className="custom-file-upload">
              <div className="custom-file-upload-left">
                <span className="upload-icon">🖼️</span>
                <div>
                  <strong>
                    {modal?.image ? modal.image.name : "Choose image"}
                  </strong>
                  <small>JPG, PNG, WEBP supported.</small>
                </div>
              </div>

              <span className="upload-action">Browse</span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {previewImage ? (
          <div className="image-preview enhanced-image-preview">
            <img src={previewImage} alt="preview" />
          </div>
        ) : (
          <div className="empty-preview-state service-empty-preview">
            <span className="empty-preview-icon">🖼️</span>
            <p>No image selected yet.</p>
          </div>
        )}

        <div className="modal-action-row">
          <button
            type="button"
            className="modal-muted-btn"
            onClick={closeModal}
            disabled={isAnyMutationPending}
          >
            Cancel
          </button>

          <button
            className="modal-submit-btn"
            onClick={handleServiceSave}
            disabled={isAnyMutationPending}
          >
            {isAnyMutationPending
              ? "Saving..."
              : modal?.id
                ? "Update Service"
                : "Create Service"}
          </button>
        </div>
      </div>
    </>
  );

  const renderManageModal = () => (
    <>
      <div className="modal-header-block manage-modal-head">
        <span className="modal-badge">Manage Entry</span>
        <h2>{modal?.service?.name}</h2>
        <p className="manage-subtitle">
          Manage categories and pricing variants for this service.
        </p>
      </div>

      <div className="modal-actions">
        <button
          className="modal-add-btn"
          onClick={() => openCategoryCreateModal(modal.service.id)}
        >
          + Add Category
        </button>
      </div>

      {!modal?.service?.service_categories?.length ? (
        <div className="empty-state">
          No categories yet. Start by adding a category.
        </div>
      ) : (
        modal.service.service_categories.map((cat) => (
          <div key={cat.id} className="category-block">
            <div className="category-header">
              <h4>{cat.name}</h4>
              <button onClick={() => openCategoryEditModal(cat)}>Edit</button>
            </div>

            <div className="category-variants">
              {cat.service_variants?.map((variant) => (
                <div key={variant.id} className="variant-item">
                  <div className="variant-details">
                    <span className="variant-name">
                      {variant.body_part}
                      {variant.size ? ` - ${variant.size}` : ""}
                    </span>

                    <span className="variant-price">
                      ₱{formatCurrency(variant.price)}
                      {variant.estimate_min != null &&
                        variant.estimate_max != null && (
                          <small className="variant-estimate">
                            Estimate: ₱{formatCurrency(variant.estimate_min)} - ₱
                            {formatCurrency(variant.estimate_max)}
                          </small>
                        )}
                    </span>
                  </div>

                  <button onClick={() => openVariantEditModal(variant, cat.id)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>

            <button
              className="btn-add-small"
              onClick={() => openVariantCreateModal(cat.id)}
            >
              + Add Variant
            </button>
          </div>
        ))
      )}
    </>
  );

  const renderCategoryModal = () => (
    <>
      <div className="modal-header-block">
        <span className="modal-badge">
          {modal?.id ? "Edit Entry" : "New Entry"}
        </span>
        <h2>{modal?.id ? "Edit Category" : "Create Category"}</h2>
        <p>Create a category to organize service variants more clearly.</p>
      </div>

      <div className="modal-form-grid">
        <div className="field-group">
          <div className="form-label-row">
            <label className="field-label">Category Name</label>
            <span>{modal?.name?.length || 0}/80</span>
          </div>
          <input
            placeholder="Category Name"
            value={modal?.name || ""}
            maxLength={80}
            onChange={(e) => updateModalField("name", e.target.value)}
          />
        </div>

        <div className="modal-action-row">
          <button
            type="button"
            className="modal-muted-btn"
            onClick={closeModal}
            disabled={isAnyMutationPending}
          >
            Cancel
          </button>

          <button
            className="modal-submit-btn"
            onClick={handleCategorySave}
            disabled={isAnyMutationPending}
          >
            {isAnyMutationPending ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </>
  );

  const renderVariantModal = () => (
    <>
      <div className="modal-header-block">
        <span className="modal-badge">
          {modal?.id ? "Edit Entry" : "New Entry"}
        </span>
        <h2>{modal?.id ? "Edit Variant" : "Create Variant"}</h2>
        <p>Add pricing details and configuration for this service variant.</p>
      </div>

      <div className="modal-form-grid">
        <div className="field-group">
          <label className="field-label">Body Part</label>
          <input
            placeholder="Body Part"
            value={modal?.body_part || ""}
            onChange={(e) => updateModalField("body_part", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Size</label>
          <input
            placeholder="Size"
            value={modal?.size || ""}
            onChange={(e) => updateModalField("size", e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={modal?.price || ""}
              onChange={(e) => updateModalField("price", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Downpayment</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Downpayment"
              value={modal?.downpayment || ""}
              onChange={(e) => updateModalField("downpayment", e.target.value)}
            />
          </div>
        </div>

        <div className="estimate-block">
          <div className="estimate-block-header">
            <label className="field-label estimate-title">Estimate Display</label>
            <span className="estimate-badge">Optional</span>
          </div>

          <p className="estimate-helper-text">
            These values are shown to customers as an estimated range and do not
            affect the actual booking or payment computation.
          </p>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Estimate Min</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={modal?.estimate_min ?? ""}
                onChange={(e) => updateModalField("estimate_min", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Estimate Max</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 2000"
                value={modal?.estimate_max ?? ""}
                onChange={(e) => updateModalField("estimate_max", e.target.value)}
              />
            </div>
          </div>

          {modal?.estimate_min !== "" &&
            modal?.estimate_min != null &&
            modal?.estimate_max !== "" &&
            modal?.estimate_max != null && (
              <div className="estimate-preview-card">
                <span className="estimate-preview-label">Customer Preview</span>
                <strong>
                  ₱{formatCurrency(modal.estimate_min)} - ₱
                  {formatCurrency(modal.estimate_max)}
                </strong>
              </div>
            )}
        </div>

        <div className="modal-action-row">
          <button
            type="button"
            className="modal-muted-btn"
            onClick={closeModal}
            disabled={isAnyMutationPending}
          >
            Cancel
          </button>

          <button
            className="modal-submit-btn"
            onClick={handleVariantSave}
            disabled={isAnyMutationPending}
          >
            {isAnyMutationPending ? "Saving..." : "Save Variant"}
          </button>
        </div>
      </div>
    </>
  );

  const renderModalContent = () => {
    if (!modal) return null;

    switch (modal.type) {
      case MODAL_TYPES.SERVICE:
        return renderServiceModal();
      case MODAL_TYPES.MANAGE:
        return renderManageModal();
      case MODAL_TYPES.CATEGORY:
        return renderCategoryModal();
      case MODAL_TYPES.VARIANT:
        return renderVariantModal();
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="services-page">
        <div className="services-header">
          <h1>Services Management</h1>

          <button className="btn-primary" onClick={openCreateServiceModal}>
            + Add Service
          </button>
        </div>

        {!isLoading && services.length > 0 && (
          <div className="services-meta">
            <p>
              Showing <strong>{paginatedServices.length}</strong> of{" "}
              <strong>{services.length}</strong> services
            </p>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="empty-state">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">No services found yet.</div>
        ) : (
          <>
            <div className="services-list">
              {paginatedServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  togglingId={togglingId}
                  onEdit={openEditServiceModal}
                  onManage={openManageModal}
                  onToggle={handleToggleService}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}

        {modal && (
          <ModalShell onClose={closeModal}>{renderModalContent()}</ModalShell>
        )}
      </div>
    </AdminLayout>
  );
};

export default Services;