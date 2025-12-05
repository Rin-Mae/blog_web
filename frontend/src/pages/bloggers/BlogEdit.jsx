import { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import BloggerHeader from "../../components/bloggerlayout/BloggerHeader";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import BloggerServices from "../../services/BloggerServices";
import { toast } from "react-toastify";

function BloggerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [subheader, setSubheader] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredFile, setFeaturedFile] = useState(null);
  const [removeFeatured, setRemoveFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const featuredInputRef = useRef(null);

  // Cropper state (match BlogCreate)
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImageUrl, setRawImageUrl] = useState("");
  const [rawImageType, setRawImageType] = useState("image/jpeg");
  const [cropping, setCropping] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TiptapLink.configure({
        autolink: true,
        openOnClick: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write your post here..." }),
      CharacterCount.configure(),
    ],
    content: "",
    autofocus: false,
  });

  const backendOrigin = (() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const u = new URL(base);
      return `${u.protocol}//${u.host}`;
    } catch {
      return "";
    }
  })();
  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (
      /^(https?:)?\/\//i.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    )
      return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const origin = backendOrigin || window.location.origin;
    return `${origin}${normalized}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await BloggerServices.getBlogDetails(id);
        const b = res?.data;
        if (!mounted || !b) return;
        setTitle(b.title || "");
        setSubheader(b.subheader || "");
        // Set editor content (only when editor is ready)
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(b.content || "");
        }
        // Set featured image preview if exists
        if (b.featured_image) {
          setFeaturedImage(resolveImageUrl(b.featured_image));
        } else {
          setFeaturedImage(null);
        }
      } catch (e) {
        // navigate back if not found
        navigate("/bloggers/my-blogs", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, editor]);

  // Revoke objectURL preview when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      try {
        if (
          featuredImage &&
          typeof featuredImage === "string" &&
          featuredImage.startsWith("blob:")
        ) {
          URL.revokeObjectURL(featuredImage);
        }
      } catch (e) {
        // ignore
      }
    };
  }, [featuredImage]);

  const handleFeaturedImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setRawImageUrl(objectUrl);
      setRawImageType(file.type || "image/jpeg");
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setRemoveFeatured(false);
    }
  };

  const onCropComplete = (_area, areaPixels) =>
    setCroppedAreaPixels(areaPixels);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = url;
    });

  // Output size optimized for header featured images (wide aspect)
  const OUTPUT_W = 2560; // width in pixels
  const OUTPUT_H = 1440; // height in pixels

  const getCroppedImg = async (imageSrc, pixelCrop, mime = "image/jpeg") => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    if (!ctx) throw new Error("Canvas not supported");
    // Draw the selected area scaled to OUTPUT_W x OUTPUT_H
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      OUTPUT_W,
      OUTPUT_H
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mime, 0.92);
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
      const ext = rawImageType.split("/")[1] || "jpg";
      const file = new File([blob], `featured_${Date.now()}.${ext}`, {
        type: rawImageType,
      });
      // Update preview + file
      const url = URL.createObjectURL(file);
      setFeaturedImage(url);
      setFeaturedFile(file);
      // Close and cleanup
      setShowCropper(false);
      try {
        URL.revokeObjectURL(rawImageUrl);
      } catch {}
      setRawImageUrl("");
    } catch (err) {
      toast.error("Unable to crop featured image.");
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

  const handleSave = async () => {
    const html = editor?.getHTML() || "";
    const plain = (editor?.getText() || "").trim();
    if (!title.trim()) return toast.error("Title is required");
    if (!plain) return toast.error("Content cannot be empty");
    const fd = new FormData();
    fd.append("title", title.trim());
    if (subheader.trim()) fd.append("subheader", subheader.trim());
    fd.append("content", html);
    if (featuredFile) fd.append("featured_image", featuredFile);
    if (removeFeatured && !featuredFile)
      fd.append("remove_featured_image", "1");
    try {
      setSubmitting(true);
      await BloggerServices.updateBlog(id, fd);
      toast.success("Post updated successfully");
      navigate(`/bloggers/my-blogs/${id}`);
    } catch (e) {
      toast.error("Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`blogger-layout sidebar-open`}>
      <BloggerHeader />
      <div className="row">
        <div className="col-12 col-md-3 col-lg-2 p-0">
          <Sidebar />
        </div>
        <main
          className="col-12 col-md-9 col-lg-10"
          style={{ overflowX: "hidden" }}
        >
          <div className="container py-5 mx-auto" style={{ maxWidth: "800px" }}>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "50vh" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fw-bold">Edit Blog Post</h2>
                  <Link
                    to={`/bloggers/my-blogs/${id}`}
                    className="text-secondary d-inline-flex align-items-center icon-action"
                    aria-label="Back to list"
                    title="Back to list"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                  >
                    <FiArrowLeft size={35} />
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    {/* Title */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Post Title
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    {/* Subheader */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Subheader (optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={subheader}
                        maxLength={255}
                        onChange={(e) => setSubheader(e.target.value)}
                      />
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Content</label>
                      <div className="card border-0">
                        <div className="card-body p-2">
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleBold().run()
                              }
                            >
                              Bold
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleItalic().run()
                              }
                            >
                              Italic
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleUnderline().run()
                              }
                            >
                              Underline
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleStrike().run()
                              }
                            >
                              Strike
                            </button>
                            <div className="vr" />
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().setParagraph().run()
                              }
                            >
                              P
                            </button>
                            {[1, 2, 3, 4].map((n) => (
                              <button
                                key={n}
                                className="btn btn-sm btn-light"
                                type="button"
                                onClick={() =>
                                  editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: n })
                                    .run()
                                }
                              >
                                H{n}
                              </button>
                            ))}
                            <div className="vr" />
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleBulletList().run()
                              }
                            >
                              • List
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .toggleOrderedList()
                                  .run()
                              }
                            >
                              1. List
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleBlockquote().run()
                              }
                            >
                              “ Quote
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().toggleCodeBlock().run()
                              }
                            >
                              {"</>"} Code
                            </button>
                            <div className="vr" />
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .setTextAlign("left")
                                  .run()
                              }
                            >
                              Left
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .setTextAlign("center")
                                  .run()
                              }
                            >
                              Center
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .setTextAlign("right")
                                  .run()
                              }
                            >
                              Right
                            </button>
                            <div className="vr" />
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .setHorizontalRule()
                                  .run()
                              }
                            >
                              HR
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() => {
                                const url = window.prompt("Enter URL");
                                if (url)
                                  editor
                                    ?.chain()
                                    .focus()
                                    .extendMarkRange("link")
                                    .setLink({ href: url })
                                    .run();
                              }}
                            >
                              Link
                            </button>
                            <div className="vr" />
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().undo().run()
                              }
                            >
                              Undo
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              type="button"
                              onClick={() =>
                                editor?.chain().focus().redo().run()
                              }
                            >
                              Redo
                            </button>
                          </div>
                          <div
                            className="border rounded bg-white p-2 editor-container"
                            style={{ minHeight: 240 }}
                          >
                            <EditorContent
                              editor={editor}
                              className="prosemirror-editor"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Featured Image
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          ref={featuredInputRef}
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleFeaturedImage}
                        />
                        {featuredImage && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              try {
                                if (
                                  typeof featuredImage === "string" &&
                                  featuredImage.startsWith("blob:")
                                ) {
                                  URL.revokeObjectURL(featuredImage);
                                }
                              } catch {}
                              try {
                                if (featuredInputRef.current)
                                  featuredInputRef.current.value = "";
                              } catch {}
                              setFeaturedImage(null);
                              setFeaturedFile(null);
                              setRemoveFeatured(true);
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {featuredImage && (
                        <div className="mt-3">
                          <img
                            src={featuredImage}
                            alt="Featured Preview"
                            className="img-fluid rounded border"
                            style={{ maxHeight: "300px", objectFit: "cover" }}
                          />
                        </div>
                      )}
                      {showCropper && (
                        <div
                          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{
                            background: "rgba(0,0,0,0.55)",
                            zIndex: 1050,
                          }}
                        >
                          <div
                            className="bg-white rounded shadow"
                            style={{ width: "min(90vw, 720px)" }}
                          >
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                              <h5 className="m-0">Crop Image</h5>
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
                                height: 420,
                              }}
                            >
                              <Cropper
                                image={rawImageUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={OUTPUT_W / OUTPUT_H}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                              />
                            </div>
                            <div className="p-3 d-flex align-items-center justify-content-between gap-4">
                              <div className="d-flex align-items-center gap-2">
                                <label className="form-label m-0 me-2">
                                  Zoom
                                </label>
                                <input
                                  type="range"
                                  min={1}
                                  max={3}
                                  step={0.1}
                                  value={zoom}
                                  onChange={(e) =>
                                    setZoom(Number(e.target.value))
                                  }
                                  style={{ width: 180 }}
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

                    {/* Submit */}
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-warning px-4 py-2 rounded-pill btn-md"
                        onClick={handleSave}
                        disabled={loading || submitting}
                        aria-busy={submitting}
                      >
                        {submitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BloggerEdit;
