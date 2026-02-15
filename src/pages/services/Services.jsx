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

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState(null);
  const [modal, setModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  /* ================= FETCH ================= */
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getAllServicesAdmin();
      setServices(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /* ================= SERVICE SAVE ================= */
  const handleServiceSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", modal.name);
      formData.append("description", modal.description);
      formData.append("duration", modal.duration);

      if (modal.image) {
        formData.append("file", modal.image); // 👈 FIXED
      }

      if (modal.id) {
        await updateService(modal.id, formData);
      } else {
        await createService(formData);
      }

      closeModal();
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySave = async () => {
    try {
      if (modal.id) {
        await updateCategory(modal.id, { name: modal.name });
      } else {
        await createCategory({
          service_id: modal.service_id,
          name: modal.name,
        });
      }
      closeModal();
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVariantSave = async () => {
    try {
      const payload = {
        category_id: modal.category_id,
        body_part: modal.body_part,
        size: modal.size,
        price: Number(modal.price),
        downpayment: Number(modal.downpayment || 0),
      };

      if (modal.id) {
        await updateVariant(modal.id, payload);
      } else {
        await createVariant(payload);
      }

      closeModal();
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleService = async (service) => {
    try {
      if (service.is_active) {
        await deleteService(service.id);
      } else {
        await reactivateService(service.id);
      }
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setModal(null);
    setPreviewImage(null);
  };

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
          <div className="loading">Loading...</div>
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
                  <div
                    className="service-title"
                    onClick={() =>
                      setExpandedService(
                        expandedService === service.id ? null : service.id,
                      )
                    }
                  >
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
                      className="btn-danger"
                      onClick={() => handleToggleService(service)}
                    >
                      {service.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>

                {/* ================= EXPANDED ================= */}
                {expandedService === service.id && (
                  <div className="service-expanded">
                    <button
                      className="btn-add-small"
                      onClick={() =>
                        setModal({
                          type: "category",
                          service_id: service.id,
                          name: "",
                        })
                      }
                    >
                      + Add Category
                    </button>

                    {service.service_categories?.map((cat) => (
                      <div key={cat.id} className="category-block">
                        <div className="category-header">
                          <h4>{cat.name}</h4>
                          <button
                            onClick={() =>
                              setModal({ ...cat, type: "category" })
                            }
                          >
                            Edit
                          </button>
                        </div>

                        <div className="variant-list">
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

                          {cat.service_variants?.map((variant) => (
                            <div key={variant.id} className="variant-item">
                              <span>
                                {variant.body_part} - {variant.size}
                              </span>
                              <span>₱{variant.price}</span>
                              <button
                                onClick={() =>
                                  setModal({
                                    ...variant,
                                    type: "variant",
                                  })
                                }
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= MODAL ================= */}
        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <h2>
                {modal.type === "service" && "Service"}
                {modal.type === "category" && "Category"}
                {modal.type === "variant" && "Variant"}
              </h2>

              {/* SERVICE */}
              {modal.type === "service" && (
                <>
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

                  <div className="image-upload-wrapper">
                    <label>Upload Service Image</label>
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
                  </div>

                  {previewImage && (
                    <div className="image-preview">
                      <img src={previewImage} alt="Preview" />
                    </div>
                  )}

                  <button onClick={handleServiceSave}>
                    {modal.id ? "Update Service" : "Create Service"}
                  </button>
                </>
              )}

              {/* CATEGORY */}
              {modal.type === "category" && (
                <>
                  <input
                    placeholder="Category Name"
                    value={modal.name}
                    onChange={(e) =>
                      setModal({ ...modal, name: e.target.value })
                    }
                  />
                  <button onClick={handleCategorySave}>Save</button>
                </>
              )}

              {/* VARIANT */}
              {modal.type === "variant" && (
                <>
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
                  <button onClick={handleVariantSave}>Save</button>
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
