import { useEffect, useState } from "react";
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

import { getAllBookings } from "../../services/BACKEND/adminBookingApi";

import "../../styles/services.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [servicesRes, bookingsRes] = await Promise.all([
        getAllServicesAdmin(),
        getAllBookings(),
      ]);

      const servicesData = servicesRes.data || servicesRes;
      const bookingsData = bookingsRes.data || bookingsRes;

      const servicesWithBookingFlag = servicesData.map((service) => {
        const ACTIVE_STATUSES = [
          "pending_payment",
          "pending_approval",
          "approved",
        ];
        const hasBookings = bookingsData.some(
          (b) => b.service_id === service.id && ACTIVE_STATUSES.includes(b.status),
        );

        return {
          ...service,
          hasBookings,
        };
      });

      setServices(servicesWithBookingFlag);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SERVICE SAVE ================= */
  const handleServiceSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", modal.name);
      formData.append("description", modal.description);
      formData.append("duration", modal.duration);

      if (modal.image) {
        formData.append("file", modal.image);
      }

      if (modal.id) {
        if (modal.hasBookings) {
          alert("Cannot edit service with existing bookings.");
          return;
        }
        await updateService(modal.id, formData);
      } else {
        await createService(formData);
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= CATEGORY SAVE ================= */
  const handleCategorySave = async () => {
    try {
      setSaving(true);

      if (modal.id) {
        await updateCategory(modal.id, { name: modal.name });
      } else {
        await createCategory({
          service_id: modal.service_id,
          name: modal.name,
        });
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= VARIANT SAVE ================= */
  const handleVariantSave = async () => {
    try {
      setSaving(true);

      const payload = {
        category_id: Number(modal.category_id || modal.categoryId),
        body_part: modal.body_part,
        size: modal.size || "",
        price: Number(modal.price),
        downpayment: Number(modal.downpayment || 0),
      };

      console.log("Payload:", payload);

      if (modal.id) {
        await updateVariant(modal.id, payload);
      } else {
        await createVariant(payload);
      }

      closeModal();
      fetchData();
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

      if (service.is_active) {
        await deleteService(service.id);
      } else {
        await reactivateService(service.id);
      }

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setModal(null);
    setPreviewImage(null);
  };

  /* ================= RENDER ================= */
  return (
    <AdminLayout>
      <div className="services-page">
        <div className="services-header">
          <h1>Services Management</h1>

          <button
            className="btn-primary"
            onClick={() =>
              setModal({
                type: "service",
                name: "",
                description: "",
                duration: "",
                image: null,
              })
            }
          >
            + Add Service
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="services-list">
            {services.map((service) => (
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
                      onClick={() =>
                        setModal({
                          ...service,
                          type: "service",
                          image: null,
                        })
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setModal({
                          type: "manage",
                          service,
                        })
                      }
                    >
                      Manage
                    </button>

                    <button
                      className="btn-danger"
                      disabled={service.hasBookings}
                      onClick={() => handleToggleService(service)}
                    >
                      {service.hasBookings
                        ? "Locked"
                        : service.is_active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= MODAL ================= */}
        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              {/* SERVICE */}
              {modal.type === "service" && (
                <>
                  <h2>Service</h2>

                  <input
                    placeholder="Service Name"
                    value={modal.name}
                    onChange={(e) =>
                      setModal({ ...modal, name: e.target.value })
                    }
                  />

                  <textarea
                    placeholder="Description"
                    value={modal.description}
                    onChange={(e) =>
                      setModal({ ...modal, description: e.target.value })
                    }
                  />

                  <input
                    placeholder="Duration"
                    value={modal.duration}
                    onChange={(e) =>
                      setModal({ ...modal, duration: e.target.value })
                    }
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setModal({ ...modal, image: file });
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }}
                  />

                  {previewImage && (
                    <div className="image-preview">
                      <img src={previewImage} alt="preview" />
                    </div>
                  )}

                  <button onClick={handleServiceSave} disabled={saving}>
                    {saving
                      ? "Saving..."
                      : modal.id
                        ? "Update Service"
                        : "Create Service"}
                  </button>
                </>
              )}

              {/* MANAGE – IMPROVED LAYOUT */}
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

                  <input
                    placeholder="Category Name"
                    value={modal.name}
                    onChange={(e) =>
                      setModal({ ...modal, name: e.target.value })
                    }
                  />

                  <button onClick={handleCategorySave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}

              {/* VARIANT */}
              {modal.type === "variant" && (
                <>
                  <h2>Variant</h2>

                  <input
                    placeholder="Body Part"
                    value={modal.body_part}
                    onChange={(e) =>
                      setModal({ ...modal, body_part: e.target.value })
                    }
                  />

                  <input
                    placeholder="Size"
                    value={modal.size}
                    onChange={(e) =>
                      setModal({ ...modal, size: e.target.value })
                    }
                  />

                  <input
                    placeholder="Price"
                    value={modal.price}
                    onChange={(e) =>
                      setModal({ ...modal, price: e.target.value })
                    }
                  />

                  <input
                    placeholder="Downpayment"
                    value={modal.downpayment}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        downpayment: e.target.value,
                      })
                    }
                  />

                  <button onClick={handleVariantSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
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
