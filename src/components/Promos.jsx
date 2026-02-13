import { useEffect, useState } from "react";
import { getActiveAnnouncements } from "../../backend/promosApi";
import "../styles/promos.css";

const Promos = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewImages, setPreviewImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const openPreview = (images, index) => {
    setPreviewImages(images);
    setCurrentIndex(index);
  };

  const closePreview = () => {
    setPreviewImages([]);
    setCurrentIndex(0);
  };

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1
    );
  };

  return (
    <section className="bulletin" id="promos">
      <div className="container">
        <div className="section-title">
          <h2>Promos & Announcements</h2>
          <p>Latest updates and special offers</p>
        </div>

        {loading && <p className="loading-text">Loading announcements...</p>}

        <div className="bulletin-board">
          {announcements.map((item) => (
            <div key={item.id} className="note-card">
              <div className="pin"></div>

              {item.images?.length > 0 && (
                <div className="note-image-grid">
                  {item.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={item.title}
                      onClick={() => openPreview(item.images, index)}
                    />
                  ))}
                </div>
              )}

              <h3>{item.title}</h3>
              <p>{item.content}</p>

              <div className="note-footer">
                {item.end_date ? (
                  <span>Until {item.end_date}</span>
                ) : (
                  <span>Ongoing</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PREVIEW OVERLAY */}
      {previewImages.length > 0 && (
        <div className="image-preview-overlay" onClick={closePreview}>
          <div
            className="image-preview-box"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImages[currentIndex]} alt="Preview" />

            {previewImages.length > 1 && (
              <>
                <button className="nav-btn left" onClick={prevImage}>
                  ‹
                </button>
                <button className="nav-btn right" onClick={nextImage}>
                  ›
                </button>
              </>
            )}

            <button className="image-preview-close" onClick={closePreview}>
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Promos;
