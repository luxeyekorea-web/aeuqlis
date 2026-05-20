"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  createId,
  getDefaultContent,
  productCategoryLabels,
  sortByDisplayOrder,
  writeStoredContent,
  type AequalisContent,
  type JournalPost,
  type Product,
  type ProductCategory,
} from "@/lib/aequalisContent";
import { useAequalisContent } from "@/lib/useAequalisContent";
import styles from "./page.module.css";

type AdminMode = "products" | "journal" | "inquiries";
type UploadTarget = "product" | "journal";
type InquiryStatus = "new" | "reviewing" | "replied" | "archived";
type AdminInquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  collaborationType: string;
  message: string;
  referenceUrl: string | null;
  status: InquiryStatus;
  adminNote: string | null;
  sourcePath: string | null;
  createdAt: string;
  updatedAt: string;
};

const inquiryTypeLabels: Record<string, string> = {
  "brand-collaboration": "브랜드 협업",
  "artisan-series": "장인 시리즈",
  "retail-exclusive": "리테일 익스클루시브",
  "press-editorial": "프레스 / 에디토리얼",
  partnership: "파트너십 제안",
  other: "기타 문의",
};

type ProductDraft = Omit<Product, "id" | "createdAt" | "updatedAt">;
type JournalDraft = Omit<JournalPost, "id" | "createdAt" | "updatedAt">;

const defaultProductImageUrl =
  "https://tqdkpyuavxnhuvuinivh.supabase.co/storage/v1/object/public/aequalis_images/collab-seone.png";
const defaultJournalImageUrl =
  "https://tqdkpyuavxnhuvuinivh.supabase.co/storage/v1/object/public/aequalis_images/journal-values.png";

const emptyProductDraft: ProductDraft = {
  title: "",
  category: "collaboration",
  subtitle: "",
  description: "",
  imageUrl: defaultProductImageUrl,
  linkUrl: "#shop",
  isActive: true,
  sortOrder: 50,
};

const emptyJournalDraft: JournalDraft = {
  title: "",
  summary: "",
  body: "",
  imageUrl: defaultJournalImageUrl,
  linkUrl: "#journal",
  isActive: true,
  sortOrder: 50,
};

function toProductDraft(product: Product): ProductDraft {
  const { id, createdAt, updatedAt, ...draft } = product;
  void id;
  void createdAt;
  void updatedAt;
  return draft;
}

function toJournalDraft(post: JournalPost): JournalDraft {
  const { id, createdAt, updatedAt, ...draft } = post;
  void id;
  void createdAt;
  void updatedAt;
  return draft;
}

export default function AdminPage() {
  const content = useAequalisContent();
  const [mode, setMode] = useState<AdminMode>("products");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [productDraft, setProductDraft] =
    useState<ProductDraft>(emptyProductDraft);
  const [journalDraft, setJournalDraft] =
    useState<JournalDraft>(emptyJournalDraft);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [inquiryStatus, setInquiryStatus] = useState<
    "idle" | "loading" | "loaded" | "saving" | "error"
  >("idle");
  const [inquiryNotes, setInquiryNotes] = useState<Record<string, string>>({});

  const products = useMemo(
    () => sortByDisplayOrder(content.products),
    [content.products],
  );
  const journals = useMemo(
    () => sortByDisplayOrder(content.journals),
    [content.journals],
  );

  const productCounts = useMemo(
    () => ({
      collaboration: content.products.filter(
        (item) => item.category === "collaboration" && item.isActive,
      ).length,
      featured: content.products.filter(
        (item) => item.category === "featured" && item.isActive,
      ).length,
    }),
    [content.products],
  );

  function getAdminToken() {
    const storedToken = window.sessionStorage.getItem("aequalis-admin-token");
    const adminToken =
      storedToken ?? window.prompt("Enter the aequalis admin token");

    if (!adminToken) {
      return null;
    }

    window.sessionStorage.setItem("aequalis-admin-token", adminToken);

    return adminToken;
  }

  async function loadInquiries() {
    const adminToken = getAdminToken();

    if (!adminToken) {
      setInquiryStatus("error");
      return;
    }

    setInquiryStatus("loading");

    try {
      const response = await fetch("/api/aequalis-inquiries", {
        headers: {
          "x-aequalis-admin-token": adminToken,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.sessionStorage.removeItem("aequalis-admin-token");
        }

        throw new Error("Unable to load inquiries");
      }

      const data = (await response.json()) as { inquiries?: AdminInquiry[] };
      const loadedInquiries = data.inquiries ?? [];

      setInquiries(loadedInquiries);
      setInquiryNotes(
        Object.fromEntries(
          loadedInquiries.map((inquiry) => [inquiry.id, inquiry.adminNote ?? ""]),
        ),
      );
      setInquiryStatus("loaded");
    } catch {
      setInquiryStatus("error");
    }
  }

  async function updateInquiry(
    id: string,
    fields: { status?: InquiryStatus; adminNote?: string },
  ) {
    const adminToken = getAdminToken();

    if (!adminToken) {
      setInquiryStatus("error");
      return;
    }

    setInquiryStatus("saving");

    try {
      const response = await fetch(`/api/aequalis-inquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-aequalis-admin-token": adminToken,
        },
        body: JSON.stringify(fields),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.sessionStorage.removeItem("aequalis-admin-token");
        }

        throw new Error("Unable to update inquiry");
      }

      const data = (await response.json()) as { inquiry?: AdminInquiry };

      const updatedInquiry = data.inquiry;

      if (updatedInquiry) {
        setInquiries((items) =>
          items.map((item) => (item.id === id ? updatedInquiry : item)),
        );
        setInquiryNotes((notes) => ({
          ...notes,
          [id]: updatedInquiry.adminNote ?? "",
        }));
      }

      setInquiryStatus("loaded");
    } catch {
      setInquiryStatus("error");
    }
  }

  function commit(nextContent: AequalisContent) {
    writeStoredContent(nextContent);
    const adminToken = getAdminToken();

    if (!adminToken) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");

    void fetch("/api/aequalis-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-aequalis-admin-token": adminToken,
      },
      body: JSON.stringify({ content: nextContent }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.sessionStorage.removeItem("aequalis-admin-token");
          }

          throw new Error("Save failed");
        }

        setSaveStatus("saved");
      })
      .catch(() => {
        setSaveStatus("error");
      });
  }

  async function uploadImage(target: UploadTarget, file: File | null) {
    if (!file) {
      return;
    }

    const adminToken = getAdminToken();

    if (!adminToken) {
      setUploadStatus("error");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", target === "product" ? "products" : "journals");
    setSaveStatus("idle");
    setUploadStatus("uploading");

    try {
      const response = await fetch("/api/aequalis-assets", {
        method: "POST",
        headers: {
          "x-aequalis-admin-token": adminToken,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.sessionStorage.removeItem("aequalis-admin-token");
        }

        throw new Error("Upload failed");
      }

      const data = (await response.json()) as { publicUrl?: string };

      if (!data.publicUrl) {
        throw new Error("Upload URL missing");
      }

      if (target === "product") {
        setProductDraft((draft) => ({ ...draft, imageUrl: data.publicUrl ?? "" }));
      } else {
        setJournalDraft((draft) => ({ ...draft, imageUrl: data.publicUrl ?? "" }));
      }

      setUploadStatus("uploaded");
    } catch {
      setUploadStatus("error");
    }
  }

  function resetAll() {
    commit(getDefaultContent());
    setEditingProductId(null);
    setEditingJournalId(null);
    setProductDraft(emptyProductDraft);
    setJournalDraft(emptyJournalDraft);
  }

  function saveProduct() {
    if (!productDraft.title.trim()) {
      return;
    }

    const timestamp = new Date().toISOString();

    if (editingProductId) {
      commit({
        ...content,
        products: content.products.map((item) =>
          item.id === editingProductId
            ? { ...item, ...productDraft, updatedAt: timestamp }
            : item,
        ),
      });
    } else {
      commit({
        ...content,
        products: [
          ...content.products,
          {
            ...productDraft,
            id: createId("product"),
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      });
    }

    setEditingProductId(null);
    setProductDraft(emptyProductDraft);
  }

  function editProduct(product: Product) {
    setMode("products");
    setEditingProductId(product.id);
    setProductDraft(toProductDraft(product));
  }

  function deleteProduct(id: string) {
    commit({
      ...content,
      products: content.products.filter((item) => item.id !== id),
    });

    if (editingProductId === id) {
      setEditingProductId(null);
      setProductDraft(emptyProductDraft);
    }
  }

  function toggleProduct(id: string) {
    const timestamp = new Date().toISOString();

    commit({
      ...content,
      products: content.products.map((item) =>
        item.id === id
          ? { ...item, isActive: !item.isActive, updatedAt: timestamp }
          : item,
      ),
    });
  }

  function saveJournal() {
    if (!journalDraft.title.trim()) {
      return;
    }

    const timestamp = new Date().toISOString();

    if (editingJournalId) {
      commit({
        ...content,
        journals: content.journals.map((item) =>
          item.id === editingJournalId
            ? { ...item, ...journalDraft, updatedAt: timestamp }
            : item,
        ),
      });
    } else {
      commit({
        ...content,
        journals: [
          ...content.journals,
          {
            ...journalDraft,
            id: createId("journal"),
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      });
    }

    setEditingJournalId(null);
    setJournalDraft(emptyJournalDraft);
  }

  function editJournal(post: JournalPost) {
    setMode("journal");
    setEditingJournalId(post.id);
    setJournalDraft(toJournalDraft(post));
  }

  function deleteJournal(id: string) {
    commit({
      ...content,
      journals: content.journals.filter((item) => item.id !== id),
    });

    if (editingJournalId === id) {
      setEditingJournalId(null);
      setJournalDraft(emptyJournalDraft);
    }
  }

  function toggleJournal(id: string) {
    const timestamp = new Date().toISOString();

    commit({
      ...content,
      journals: content.journals.map((item) =>
        item.id === id
          ? { ...item, isActive: !item.isActive, updatedAt: timestamp }
          : item,
      ),
    });
  }

  return (
    <main className={styles.adminPage}>
      <header className={styles.topbar}>
        <div>
          <p>aequalis admin</p>
          <h1>Content Control</h1>
        </div>
        <nav>
          <span aria-live="polite">
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved to Supabase"
                : saveStatus === "error"
                  ? "Supabase save failed"
                  : uploadStatus === "uploading"
                    ? "Uploading image..."
                    : uploadStatus === "uploaded"
                      ? "Image uploaded"
                      : uploadStatus === "error"
                        ? "Image upload failed"
                        : inquiryStatus === "loading"
                          ? "Loading inquiries..."
                          : inquiryStatus === "saving"
                            ? "Saving inquiry..."
                            : inquiryStatus === "error"
                              ? "Inquiry action failed"
                        : ""}
          </span>
          <a href="/aequalis">View landing</a>
          <button type="button" onClick={resetAll}>
            Reset demo data
          </button>
        </nav>
      </header>

      <section className={styles.summary}>
        <div>
          <span>active collaboration</span>
          <strong>{productCounts.collaboration}</strong>
        </div>
        <div>
          <span>active featured</span>
          <strong>{productCounts.featured}</strong>
        </div>
        <div>
          <span>active journal</span>
          <strong>{content.journals.filter((item) => item.isActive).length}</strong>
        </div>
        <div>
          <span>new inquiries</span>
          <strong>{inquiries.filter((item) => item.status === "new").length}</strong>
        </div>
      </section>

      <div className={styles.tabs} role="tablist" aria-label="Admin sections">
        <button
          type="button"
          className={mode === "products" ? styles.activeTab : ""}
          onClick={() => setMode("products")}
        >
          Products
        </button>
        <button
          type="button"
          className={mode === "journal" ? styles.activeTab : ""}
          onClick={() => setMode("journal")}
        >
          Journal
        </button>
        <button
          type="button"
          className={mode === "inquiries" ? styles.activeTab : ""}
          onClick={() => {
            setMode("inquiries");

            if (inquiryStatus === "idle") {
              void loadInquiries();
            }
          }}
        >
          Inquiries
        </button>
      </div>

      {mode === "products" ? (
        <section className={styles.workspace}>
          <form
            className={styles.editor}
            onSubmit={(event) => {
              event.preventDefault();
              saveProduct();
            }}
          >
            <div className={styles.editorHeading}>
              <span>Product editor</span>
              <strong>{editingProductId ? "Edit item" : "New item"}</strong>
            </div>

            <label>
              Product name
              <input
                value={productDraft.title}
                onChange={(event) =>
                  setProductDraft({ ...productDraft, title: event.target.value })
                }
                placeholder="minimal shirt jacket"
              />
            </label>

            <label>
              Category
              <select
                value={productDraft.category}
                onChange={(event) =>
                  setProductDraft({
                    ...productDraft,
                    category: event.target.value as ProductCategory,
                  })
                }
              >
                {Object.entries(productCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.twoColumns}>
              <label>
                Subtitle
                <input
                  value={productDraft.subtitle}
                  onChange={(event) =>
                    setProductDraft({
                      ...productDraft,
                      subtitle: event.target.value,
                    })
                  }
                  placeholder="foundation line"
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  value={productDraft.sortOrder}
                  onChange={(event) =>
                    setProductDraft({
                      ...productDraft,
                      sortOrder: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>

            <label>
              Secondary line
              <input
                value={productDraft.description}
                onChange={(event) =>
                  setProductDraft({
                    ...productDraft,
                    description: event.target.value,
                  })
                }
                placeholder="casual luxury line"
              />
            </label>

            <div className={styles.imageTools}>
              <div className={styles.preview}>
                {productDraft.imageUrl ? (
                  <Image
                    src={productDraft.imageUrl}
                    alt=""
                    width={280}
                    height={210}
                    unoptimized
                  />
                ) : null}
              </div>
              <label className={styles.uploadButton}>
                Replace image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    void uploadImage("product", event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className={styles.storageNote}>
              Images are stored in Supabase Storage.
            </p>

            <label>
              Link URL
              <input
                value={productDraft.linkUrl}
                onChange={(event) =>
                  setProductDraft({
                    ...productDraft,
                    linkUrl: event.target.value,
                  })
                }
                placeholder="#shop"
              />
            </label>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={productDraft.isActive}
                onChange={(event) =>
                  setProductDraft({
                    ...productDraft,
                    isActive: event.target.checked,
                  })
                }
              />
              Show on landing page
            </label>

            <div className={styles.actions}>
              <button type="submit">
                {editingProductId ? "Save product" : "Add product"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setEditingProductId(null);
                  setProductDraft(emptyProductDraft);
                }}
              >
                Clear
              </button>
            </div>
          </form>

          <div className={styles.listPanel}>
            <div className={styles.listHeading}>
              <span>Products</span>
              <strong>{products.length}</strong>
            </div>
            <div className={styles.itemList}>
              {products.map((product) => (
                <article className={styles.itemRow} key={product.id}>
                  <Image
                    src={product.imageUrl}
                    alt=""
                    width={86}
                    height={76}
                    unoptimized
                  />
                  <div>
                    <span className={styles.kicker}>
                      {productCategoryLabels[product.category]} / order{" "}
                      {product.sortOrder}
                    </span>
                    <h2>{product.title}</h2>
                    <p>
                      {[product.subtitle, product.description]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className={styles.rowActions}>
                    <button type="button" onClick={() => toggleProduct(product.id)}>
                      {product.isActive ? "Active" : "Inactive"}
                    </button>
                    <button type="button" onClick={() => editProduct(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : mode === "journal" ? (
        <section className={styles.workspace}>
          <form
            className={styles.editor}
            onSubmit={(event) => {
              event.preventDefault();
              saveJournal();
            }}
          >
            <div className={styles.editorHeading}>
              <span>Journal editor</span>
              <strong>{editingJournalId ? "Edit post" : "New post"}</strong>
            </div>

            <label>
              Title
              <input
                value={journalDraft.title}
                onChange={(event) =>
                  setJournalDraft({ ...journalDraft, title: event.target.value })
                }
                placeholder="on parallel values"
              />
            </label>

            <div className={styles.twoColumns}>
              <label>
                Link URL
                <input
                  value={journalDraft.linkUrl}
                  onChange={(event) =>
                    setJournalDraft({
                      ...journalDraft,
                      linkUrl: event.target.value,
                    })
                  }
                  placeholder="#journal"
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  value={journalDraft.sortOrder}
                  onChange={(event) =>
                    setJournalDraft({
                      ...journalDraft,
                      sortOrder: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>

            <label>
              Summary
              <textarea
                value={journalDraft.summary}
                onChange={(event) =>
                  setJournalDraft({
                    ...journalDraft,
                    summary: event.target.value,
                  })
                }
                rows={3}
              />
            </label>

            <label>
              Body
              <textarea
                value={journalDraft.body}
                onChange={(event) =>
                  setJournalDraft({
                    ...journalDraft,
                    body: event.target.value,
                  })
                }
                rows={7}
              />
            </label>

            <div className={styles.imageTools}>
              <div className={styles.preview}>
                {journalDraft.imageUrl ? (
                  <Image
                    src={journalDraft.imageUrl}
                    alt=""
                    width={280}
                    height={210}
                    unoptimized
                  />
                ) : null}
              </div>
              <label className={styles.uploadButton}>
                Replace image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    void uploadImage("journal", event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className={styles.storageNote}>
              Images are stored in Supabase Storage.
            </p>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={journalDraft.isActive}
                onChange={(event) =>
                  setJournalDraft({
                    ...journalDraft,
                    isActive: event.target.checked,
                  })
                }
              />
              Show on landing page
            </label>

            <div className={styles.actions}>
              <button type="submit">
                {editingJournalId ? "Save post" : "Add post"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setEditingJournalId(null);
                  setJournalDraft(emptyJournalDraft);
                }}
              >
                Clear
              </button>
            </div>
          </form>

          <div className={styles.listPanel}>
            <div className={styles.listHeading}>
              <span>Journal</span>
              <strong>{journals.length}</strong>
            </div>
            <div className={styles.itemList}>
              {journals.map((post) => (
                <article className={styles.itemRow} key={post.id}>
                  <Image
                    src={post.imageUrl}
                    alt=""
                    width={86}
                    height={76}
                    unoptimized
                  />
                  <div>
                    <span className={styles.kicker}>order {post.sortOrder}</span>
                    <h2>{post.title}</h2>
                    <p>{post.summary}</p>
                  </div>
                  <div className={styles.rowActions}>
                    <button type="button" onClick={() => toggleJournal(post.id)}>
                      {post.isActive ? "Active" : "Inactive"}
                    </button>
                    <button type="button" onClick={() => editJournal(post)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => deleteJournal(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.inquiryWorkspace}>
          <div className={styles.listPanel}>
            <div className={styles.listHeading}>
              <span>Partnership inquiries</span>
              <strong>{inquiries.length}</strong>
            </div>
            <div className={styles.inquiryToolbar}>
              <p>
                상세페이지 문의 폼으로 접수된 요청입니다. 상태와 내부 메모만
                관리자에서 관리합니다.
              </p>
              <button type="button" onClick={() => void loadInquiries()}>
                Refresh
              </button>
            </div>
            <div className={styles.inquiryList}>
              {inquiries.length ? (
                inquiries.map((inquiry) => (
                  <article className={styles.inquiryRow} key={inquiry.id}>
                    <div className={styles.inquiryMeta}>
                      <span className={styles.kicker}>
                        {new Date(inquiry.createdAt).toLocaleString("ko-KR")} /{" "}
                        {inquiryTypeLabels[inquiry.collaborationType] ??
                          inquiry.collaborationType}
                      </span>
                      <h2>
                        {inquiry.name}
                        {inquiry.company ? ` / ${inquiry.company}` : ""}
                      </h2>
                      <p>{inquiry.message}</p>
                      <dl>
                        <div>
                          <dt>Email</dt>
                          <dd>
                            <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                          </dd>
                        </div>
                        {inquiry.phone ? (
                          <div>
                            <dt>Phone</dt>
                            <dd>{inquiry.phone}</dd>
                          </div>
                        ) : null}
                        {inquiry.referenceUrl ? (
                          <div>
                            <dt>Reference</dt>
                            <dd>{inquiry.referenceUrl}</dd>
                          </div>
                        ) : null}
                        {inquiry.sourcePath ? (
                          <div>
                            <dt>Source</dt>
                            <dd>{inquiry.sourcePath}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                    <div className={styles.inquiryControls}>
                      <label>
                        Status
                        <select
                          value={inquiry.status}
                          onChange={(event) =>
                            void updateInquiry(inquiry.id, {
                              status: event.target.value as InquiryStatus,
                            })
                          }
                        >
                          <option value="new">new</option>
                          <option value="reviewing">reviewing</option>
                          <option value="replied">replied</option>
                          <option value="archived">archived</option>
                        </select>
                      </label>
                      <label>
                        Admin note
                        <textarea
                          rows={5}
                          value={inquiryNotes[inquiry.id] ?? ""}
                          onChange={(event) =>
                            setInquiryNotes({
                              ...inquiryNotes,
                              [inquiry.id]: event.target.value,
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          void updateInquiry(inquiry.id, {
                            adminNote: inquiryNotes[inquiry.id] ?? "",
                          })
                        }
                      >
                        Save note
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className={styles.emptyState}>
                  {inquiryStatus === "loading"
                    ? "Loading inquiries..."
                    : "No inquiries yet."}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
