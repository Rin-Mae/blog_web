import { useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import Footer from "../../components/bloggerlayout/BloggerFooter";
import Header from "../../components/bloggerlayout/BloggerHeader";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import BloggerServices from "../../services/BloggerServices";
import UserPlaceholder from "../../assets/images/user-placeholder.png";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(UserPlaceholder);
  const [postsCount, setPostsCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Image cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImageUrl, setRawImageUrl] = useState("");
  const [rawImageType, setRawImageType] = useState("image/jpeg");
  const [cropping, setCropping] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    birthdate: "",
    age: "",
    contact_number: "",
    address: "",
    profile_image: undefined,
    remove_profile_image: false,
  });

  const mapResponseToForm = useMemo(
    () => (user) => ({
      firstname: user.firstname || "",
      middlename: user.middlename || "",
      lastname: user.lastname || "",
      email: user.email || "",
      birthdate: user.birthdate || "",
      age: user.age ?? "",
      contact_number: user.contact_number || "",
      address: user.address || "",
    }),
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await BloggerServices.getProfile();
        const user = data?.user || {};
        setFormData(mapResponseToForm(user));
        if (user.profile_image_url) {
          setPreviewImage(user.profile_image_url);
        }
        // Also fetch blogger's posts to display count
        try {
          const blogsData = await BloggerServices.getMyBlogs();
          let count = 0;
          if (Array.isArray(blogsData)) {
            count = blogsData.length;
          } else if (Array.isArray(blogsData?.blogs)) {
            count = blogsData.blogs.length;
          } else if (Array.isArray(blogsData?.data)) {
            count = blogsData.data.length;
          } else if (typeof blogsData?.total === "number") {
            count = blogsData.total;
          } else if (typeof blogsData?.blogs?.total === "number") {
            count = blogsData.blogs.total;
          }
          setPostsCount(count);
        } catch (err) {
          // Non-fatal: show toast but continue
          toast.error("Failed to load posts count.");
        }
      } catch (e) {
        setError("Failed to load profile.");
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [mapResponseToForm]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setRawImageUrl(objectUrl);
      setRawImageType(file.type || "image/jpeg");
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  const onCropComplete = (_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, mime = "image/jpeg") => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const safeWidth = pixelCrop.width;
    const safeHeight = pixelCrop.height;
    canvas.width = safeWidth;
    canvas.height = safeHeight;

    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      safeWidth,
      safeHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        mime,
        0.92
      );
    });
  };

  const applyCrop = async () => {
    if (!rawImageUrl || !croppedAreaPixels) return;
    try {
      setCropping(true);
      const blob = await getCroppedImg(
        rawImageUrl,
        croppedAreaPixels,
        rawImageType
      );
      if (!blob) throw new Error("Cropping failed");
      const fileName =
        `profile_${Date.now()}.` + (rawImageType.split("/")[1] || "jpg");
      const croppedFile = new File([blob], fileName, { type: rawImageType });

      // Update preview and form data
      const croppedUrl = URL.createObjectURL(croppedFile);
      setPreviewImage(croppedUrl);
      setFormData((prev) => ({ ...prev, profile_image: croppedFile }));

      // Close cropper and cleanup raw url
      setShowCropper(false);
      // Revoke raw URL to avoid memory leaks
      try {
        URL.revokeObjectURL(rawImageUrl);
      } catch {}
      setRawImageUrl("");
    } catch (err) {
      toast.error("Unable to crop image. Please try another photo.");
    } finally {
      setCropping(false);
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    try {
      URL.revokeObjectURL(rawImageUrl);
    } catch {}
    setRawImageUrl("");
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        setError("");
        setFieldErrors({});
        setSaving(true);
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "remove_profile_image") {
            // Send explicit boolean flag if true
            if (value === true) payload.append(key, "1");
            return;
          }
          if (value !== undefined && value !== null) payload.append(key, value);
        });
        const res = await BloggerServices.updateProfile(payload);
        const user = res?.user || {};
        setFormData(mapResponseToForm(user));
        if (user.profile_image_url) setPreviewImage(user.profile_image_url);
        toast.success(res?.message || "Profile updated successfully.");
      } catch (e) {
        const apiMsg = e?.response?.data?.message;
        const apiErrors = e?.response?.data?.errors;
        if (apiErrors && typeof apiErrors === "object") {
          setFieldErrors(apiErrors);
        }
        setError(apiMsg || "Failed to save changes.");
        toast.error(apiMsg || "Failed to save changes.");
        return;
      } finally {
        setSaving(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Header />

      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-md-3 col-lg-2 p-0">
            <Sidebar />
          </div>
          <main className="col-12 col-md-9 col-lg-10 min-vh-100 bg-light d-flex justify-content-center p-4">
            <div className="w-100" style={{ maxWidth: "1000px" }}>
              <div className="card shadow p-4 position-relative">
                {(loading || saving) && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                    style={{ zIndex: 10 }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                <h2 className="fw-semibold ">Profile</h2>
                <hr />

                {/* Profile Picture Section */}
                <div className="d-flex justify-content-between align-items-center pb-4 border-bottom">
                  {/* Left: Profile Image */}
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="rounded-circle border"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <p className="fw-medium mb-0">Profile picture</p>
                    </div>
                  </div>

                  {/* Center: Posts Count */}
                  <div className="d-flex flex-column align-items-center">
                    <h6 className="fw-semibold mb-0">Posts</h6>
                    <p className="mb-0">{postsCount}</p>
                  </div>

                  {/* Right: Buttons (reserve space even if hidden) */}
                  <div className="d-flex gap-2" style={{ minWidth: "150px" }}>
                    {isEditing ? (
                      <>
                        <label
                          htmlFor="profileImage"
                          className="btn btn-outline-secondary btn-sm"
                        >
                          Upload new picture
                        </label>
                        <input
                          type="file"
                          id="profileImage"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete your profile picture?"
                              )
                            ) {
                              setPreviewImage(UserPlaceholder);
                              setFormData((prev) => ({
                                ...prev,
                                profile_image: undefined,
                                remove_profile_image: true,
                              }));
                              // Close cropper if open and cleanup
                              if (showCropper) cancelCrop();
                            }
                          }}
                        >
                          Delete picture
                        </button>
                      </>
                    ) : (
                      <div style={{ width: "150px" }}></div> // empty space to keep posts centered
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div className="mt-4">
                  <h5 className="fw-medium text-dark mb-2">Full name</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-muted">
                        First name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext bg-light p-2 rounded">
                          {formData.firstname}
                        </p>
                      )}
                      {fieldErrors.firstname && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.firstname[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted">
                        Middle name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="middlename"
                          value={formData.middlename}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext bg-light p-2 rounded">
                          {formData.middlename}
                        </p>
                      )}
                      {fieldErrors.middlename && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.middlename[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted">Last name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext bg-light p-2 rounded">
                          {formData.lastname}
                        </p>
                      )}
                      {fieldErrors.lastname && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.lastname[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Birthdate and Age */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h5 className="fw-medium text-dark mb-2">Birthdate</h5>
                    {isEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext bg-light p-2 rounded">
                        {formData.birthdate}
                      </p>
                    )}
                    {fieldErrors.birthdate && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.birthdate[0]}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h5 className="fw-medium text-dark mb-2">Age</h5>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext bg-light p-2 rounded">
                        {formData.age}
                      </p>
                    )}
                    {fieldErrors.age && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.age[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="mt-4">
                  <h5 className="fw-medium text-dark mb-2">Phone Number</h5>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-control-plaintext bg-light p-2 rounded">
                      {formData.contact_number}
                    </p>
                  )}
                  {fieldErrors.contact_number && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.contact_number[0]}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="mt-4">
                  <h5 className="fw-medium text-dark mb-2">Address</h5>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-control-plaintext bg-light p-2 rounded">
                      {formData.address}
                    </p>
                  )}
                  {fieldErrors.address && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.address[0]}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    className="btn btn-warning"
                    onClick={handleEditToggle}
                    disabled={saving || loading}
                  >
                    {isEditing
                      ? saving
                        ? "Saving..."
                        : "Save Changes"
                      : "Edit Details"}
                  </button>
                </div>
                {error && <p className="text-danger mt-3">{error}</p>}
              </div>
              {showCropper && (
                <div
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ background: "rgba(0,0,0,0.55)", zIndex: 1050 }}
                >
                  <div
                    className="bg-white rounded shadow"
                    style={{ width: "min(90vw, 600px)" }}
                  >
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                      <h5 className="m-0">Crop Profile Picture</h5>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={cancelCrop}
                        disabled={cropping}
                      >
                        Cancel
                      </button>
                    </div>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 360,
                      }}
                    >
                      <Cropper
                        image={rawImageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="p-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label m-0 me-2">Zoom</label>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          style={{ width: 160 }}
                        />
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={applyCrop}
                        disabled={cropping}
                      >
                        {cropping ? "Applying..." : "Apply Crop"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
