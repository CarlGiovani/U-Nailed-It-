import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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

const Services = () => {
  const [modal, setModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const normalizeDurationForInput = (value) => {
    if (!value) return "";

    if (/^\d{2}:\d{2}$/.test(value)) return value;

    if (/^\d+$/.test(String(value))) {
      const totalMinutes = Number(value);
      const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const minutes = String(totalMinutes % 60).padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    return "";
  };

  /* ================= CACHED FETCH ================= */
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const servicesRes = await getAllServicesAdmin();
      return servicesRes?.data || servicesRes || [];
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const servicesById = useMemo(() => {
    return new Map(services.map((service) => [service.id, service]));
  }, [services]);

  const invalidateServices = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
  };

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

  const closeModal = () => {
    setModal(null);
    setPreviewImage(null);
  };

  const openCreateServiceModal = () => {
    setPreviewImage(null);
    setModal({
      type: "service",
      name: "",
      description: "",
      duration: "01:00",
      image: null,
    });
  };

  const openEditServiceModal = (service) => {
    setPreviewImage(service.image_url || null);
    setModal({
      ...service,
      type: "service",
      duration: normalizeDurationForInput(service.duration),
      image: null,
    });
  };

  const openManageModal = (service) => {
    const freshService = servicesById.get(service.id) || service;

    setPreviewImage(null);
    setModal({
      type: "manage",
      service: freshService,
    });
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE));

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return services.slice(startIndex, endIndex);
  }, [services, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  /* ================= SERVICE SAVE ================= */
  const handleServiceSave = async () => {
    if (!modal) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", modal.name || "");
      formData.append("description", modal.description || "");
      formData.append("duration", modal.duration || "");

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
    } finally {
      setSaving(false);
    }
  };

  /* ================= CATEGORY SAVE ================= */
  const handleCategorySave = async () => {
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
    } finally {
      setSaving(false);
    }
  };

  /* ================= VARIANT SAVE ================= */
  const handleVariantSave = async () => {
    if (!modal) return;

    try {
      setSaving(true);

      const payload = {
        category_id: Number(modal.category_id || modal.categoryId),
        body_part: modal.body_part,
        size: modal.size || "",
        price: Number(modal.price),
        downpayment: Number(modal.downpayment || 0),
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
    } finally {
      setSaving(false);
    }
  };

  /* ================= TOGGLE SERVICE ================= */
  const handleToggleService = async (service) => {
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
    } finally {
      setTogglingId(null);
    }
  };

  const isAnyMutationPending =
    saving ||
    createServiceMutation.isPending ||
    updateServiceMutation.isPending ||
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    createVariantMutation.isPending ||
    updateVariantMutation.isPending;

  /* ================= RENDER ================= */
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
          <div>Loading...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">No services found yet.</div>
        ) : (
          <>
            <div className="services-list">
              {paginatedServices.map((service) => (
                <div key={service.id} className="service-card">
                  {service.image_url && (
                    <div className="service-image-wrapper">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="service-image"
                      />
                    </div>
                  )}

                  <div className="service-top">
                    <div className="service-title">
                      <h3>{service.name}</h3>

                      <span
                        className={
                          service.is_active ? "status-active" : "status-inactive"
                        }
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="service-buttons">
                      <button
                        className="btn-secondary"
                        disabled={service.hasBookings}
                        onClick={() => openEditServiceModal(service)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => openManageModal(service)}
                      >
                        Manage
                      </button>

                      <button
                        className="btn-danger"
                        disabled={
                          service.hasBookings || togglingId === service.id
                        }
                        onClick={() => handleToggleService(service)}
                      >
                        {service.hasBookings
                          ? "Locked"
                          : togglingId === service.id
                            ? "Saving..."
                            : service.is_active
                              ? "Deactivate"
                              : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage - 1)}
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
                        className={`pagination-number ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ================= MODAL ================= */}
        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              {/* SERVICE */}
              {modal.type === "service" && (
                <>
                  <h2>{modal.id ? "Edit Service" : "Create Service"}</h2>

                  <div className="modal-form-grid">
                    <div className="field-group">
                      <label className="field-label">Service Name</label>
                      <input
                        placeholder="Enter service name"
                        value={modal.name}
                        onChange={(e) =>
                          setModal({ ...modal, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Description</label>
                      <textarea
                        placeholder="Write a short description"
                        value={modal.description}
                        onChange={(e) =>
                          setModal({ ...modal, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Duration</label>
                        <input
                          type="time"
                          step="900"
                          value={modal.duration || "01:00"}
                          onChange={(e) =>
                            setModal({ ...modal, duration: e.target.value })
                          }
                        />
                      </div>

                      <div className="field-group">
                        <label className="field-label">Upload Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setModal({ ...modal, image: file });
                              setPreviewImage(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                    </div>

                    {previewImage && (
                      <div className="image-preview">
                        <img src={previewImage} alt="preview" />
                      </div>
                    )}

                    <button
                      className="modal-submit-btn"
                      onClick={handleServiceSave}
                      disabled={isAnyMutationPending}
                    >
                      {isAnyMutationPending
                        ? "Saving..."
                        : modal.id
                          ? "Update Service"
                          : "Create Service"}
                    </button>
                  </div>
                </>
              )}

              {/* MANAGE */}
              {modal.type === "manage" && (
                <>
                  <div className="manage-header">
                    <h2>{modal.service.name}</h2>
                    <p className="manage-subtitle">
                      Manage categories and pricing variants
                    </p>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="modal-add-btn"
                      onClick={() =>
                        setModal({
                          type: "category",
                          service_id: modal.service.id,
                          name: "",
                        })
                      }
                    >
                      + Add Category
                    </button>
                  </div>

                  {!modal.service.service_categories?.length ? (
                    <div className="empty-state">
                      No categories yet. Start by adding a category.
                    </div>
                  ) : (
                    modal.service.service_categories.map((cat) => (
                      <div key={cat.id} className="category-block">
                        <div className="category-header">
                          <h4>{cat.name}</h4>
                          <button
                            onClick={() =>
                              setModal({
                                ...cat,
                                type: "category",
                              })
                            }
                          >
                            Edit
                          </button>
                        </div>

                        <div className="category-variants">
                          {cat.service_variants?.map((variant) => (
                            <div key={variant.id} className="variant-item">
                              <div className="variant-details">
                                <span className="variant-name">
                                  {variant.body_part} - {variant.size}
                                </span>
                                <span className="variant-price">
                                  ₱{variant.price}
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  setModal({
                                    id: variant.id,
                                    type: "variant",
                                    category_id: cat.id,
                                    body_part: variant.body_part,
                                    size: variant.size,
                                    price: variant.price,
                                    downpayment: variant.downpayment,
                                  })
                                }
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          className="btn-add-small"
                          onClick={() =>
                            setModal({
                              type: "variant",
                              category_id: cat.id,
                              body_part: "",
                              size: "",
                              price: "",
                              downpayment: "",
                            })
                          }
                        >
                          + Add Variant
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* CATEGORY */}
              {modal.type === "category" && (
                <>
                  <h2>Category</h2>

                  <div className="modal-form-grid">
                    <div className="field-group">
                      <label className="field-label">Category Name</label>
                      <input
                        placeholder="Category Name"
                        value={modal.name}
                        onChange={(e) =>
                          setModal({ ...modal, name: e.target.value })
                        }
                      />
                    </div>

                    <button
                      className="modal-submit-btn"
                      onClick={handleCategorySave}
                      disabled={isAnyMutationPending}
                    >
                      {isAnyMutationPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              )}

              {/* VARIANT */}
              {modal.type === "variant" && (
                <>
                  <h2>Variant</h2>

                  <div className="modal-form-grid">
                    <div className="field-group">
                      <label className="field-label">Body Part</label>
                      <input
                        placeholder="Body Part"
                        value={modal.body_part}
                        onChange={(e) =>
                          setModal({ ...modal, body_part: e.target.value })
                        }
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Size</label>
                      <input
                        placeholder="Size"
                        value={modal.size}
                        onChange={(e) =>
                          setModal({ ...modal, size: e.target.value })
                        }
                      />
                    </div>

                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Price</label>
                        <input
                          type="number"
                          placeholder="Price"
                          value={modal.price}
                          onChange={(e) =>
                            setModal({ ...modal, price: e.target.value })
                          }
                        />
                      </div>

                      <div className="field-group">
                        <label className="field-label">Downpayment</label>
                        <input
                          type="number"
                          placeholder="Downpayment"
                          value={modal.downpayment}
                          onChange={(e) =>
                            setModal({
                              ...modal,
                              downpayment: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <button
                      className="modal-submit-btn"
                      onClick={handleVariantSave}
                      disabled={isAnyMutationPending}
                    >
                      {isAnyMutationPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Services;