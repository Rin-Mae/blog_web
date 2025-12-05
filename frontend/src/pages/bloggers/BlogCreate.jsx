import { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import BloggerHeader from "../../components/bloggerlayout/BloggerHeader";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import BloggerFooter from "../../components/bloggerlayout/BloggerFooter";
import BloggerServices from "../../services/BloggerServices";

function CreateBlog() {
  const [featuredImage, setFeaturedImage] = useState(null);
  const featuredInputRef = useRef(null);
  // Cropping state for featured image
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImageUrl, setRawImageUrl] = useState("");
  const [rawImageType, setRawImageType] = useState("image/jpeg");
  const [cropping, setCropping] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [title, setTitle] = useState("");
  const [subheader, setSubheader] = useState("");
  const [featuredFile, setFeaturedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
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
    autofocus: "end",
  });

  const handleFeaturedImage = (e) => {
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

  // In-editor image insertion removed. Use Featured Image field below.

  // Simple TipTap toolbar actions
  const toggle = (fn) => editor && editor.chain().focus()[fn]().run();
  const setHeading = (level) =>
    editor && editor.chain().focus().toggleHeading({ level }).run();
  const setAlign = (align) =>
    editor && editor.chain().focus().setTextAlign(align).run();
  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url)
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
  };

  // Inject font CSS
  useEffect(() => {
    const id = "quill-fonts-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        .ql-font-georgia { font-family: Georgia, serif; }
        .ql-font-times-new-roman { font-family: "Times New Roman", Times, serif; }
        .ql-font-arial { font-family: Arial, Helvetica, sans-serif; }
        .ql-font-monospace { font-family: Menlo, Monaco, monospace; }
        .ql-font-sans-serif { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial; }
        .ql-font-serif { font-family: Georgia, 'Times New Roman', Times, serif; }
        /* Remove focus outline/black border for TipTap editor's ProseMirror */
        .ProseMirror:focus { outline: none !important; box-shadow: none !important; }
        .ProseMirror { outline: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (!editor) return;
    const updateCount = () => {
      try {
        const text = editor.getText();
        setCharCount(text ? text.length : 0);
      } catch (e) {
        setCharCount(0);
      }
    };

    updateCount();
    editor.on("update", updateCount);
    return () => editor.off("update", updateCount);
  }, [editor]);

  return (
    <div className={`blogger-layout sidebar-open`}>
      <BloggerHeader />
      <div className="d-flex">
        <Sidebar />
        <main className="blogger-main flex-fill p-4">
          <div className="container py-5 mx-auto" style={{ maxWidth: "800px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Create Blog Post</h2>
              <Link
                to="/bloggers/my-blogs"
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
                <div className="mb-4">
                  <label className="form-label fw-semibold">Post Title</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter your blog title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Subheader (optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter a short subtitle..."
                    value={subheader}
                    maxLength={255}
                    onChange={(e) => setSubheader(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold">Content</label>
                  <div className="card border-0">
                    <div className="card-body p-2">
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleBold")}
                        >
                          Bold
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleItalic")}
                        >
                          Italic
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleUnderline")}
                        >
                          Underline
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleStrike")}
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
                            onClick={() => setHeading(n)}
                          >
                            H{n}
                          </button>
                        ))}
                        <div className="vr" />
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleBulletList")}
                        >
                          • List
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleOrderedList")}
                        >
                          1. List
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleBlockquote")}
                        >
                          “ Quote
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => toggle("toggleCodeBlock")}
                        >
                          {"</>"} Code
                        </button>
                        <div className="vr" />
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => setAlign("left")}
                        >
                          Left
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => setAlign("center")}
                        >
                          Center
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => setAlign("right")}
                        >
                          Right
                        </button>
                        <div className="vr" />
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().setHorizontalRule().run()
                          }
                        >
                          HR
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={setLink}
                        >
                          Link
                        </button>
                        <div className="vr" />
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => editor?.chain().focus().undo().run()}
                        >
                          Undo
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => editor?.chain().focus().redo().run()}
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
                      <div className="text-end text-muted small mt-1">
                        {charCount} chars
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className=" fw-semibold">Featured Image</label>
                  <div className="d-flex align-items-center gap-4">
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
                          } catch (e) {
                            // ignore
                          }
                          try {
                            if (featuredInputRef.current)
                              featuredInputRef.current.value = "";
                          } catch (e) {
                            // ignore
                          }
                          setFeaturedImage(null);
                          setFeaturedFile(null);
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
                        className="img-fluid rounded border"
                        alt="Featured Preview"
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
                {showCropper && (
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: "rgba(0,0,0,0.55)", zIndex: 1050 }}
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
                      <div className="p-3 d-flex align-items-center justify-content-between gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <label className="form-label m-0 me-2">Zoom</label>
                          <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
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
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-warning px-4 py-2 rounded-pill btn-md"
                    disabled={submitting}
                    onClick={async () => {
                      try {
                        if (!title.trim()) {
                          toast.error("Title is required");
                          return;
                        }
                        const html = editor?.getHTML() || "";
                        const plain = (editor?.getText() || "").trim();
                        if (!plain) {
                          toast.error("Content cannot be empty");
                          return;
                        }
                        setSubmitting(true);
                        const fd = new FormData();
                        fd.append("title", title.trim());
                        if (subheader.trim())
                          fd.append("subheader", subheader.trim());
                        fd.append("content", html);
                        // subheader is optional; add later when field exists
                        if (featuredFile) {
                          fd.append("featured_image", featuredFile);
                        }
                        const res = await BloggerServices.createBlog(fd);
                        toast.success("Post published");
                        navigate("/bloggers/my-blogs");
                      } catch (err) {
                        const msg =
                          err?.response?.data?.message || "Failed to publish";
                        toast.error(msg);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? "Publishing..." : "Publish Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BloggerFooter />
    </div>
  );
}

export default CreateBlog;
