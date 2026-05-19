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

type AdminMode = "products" | "journal";

type ProductDraft = Omit<Product, "id" | "createdAt" | "updatedAt">;
type JournalDraft = Omit<JournalPost, "id" | "createdAt" | "updatedAt">;

const emptyProductDraft: ProductDraft = {
  title: "",
  category: "collaboration",
  subtitle: "",
  description: "",
  imageUrl: "/images/aequalis/collab-seone.png",
  linkUrl: "#shop",
  isActive: true,
  sortOrder: 50,
};

const emptyJournalDraft: JournalDraft = {
  title: "",
  summary: "",
  body: "",
  imageUrl: "/images/aequalis/journal-values.png",
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [productDraft, setProductDraft] =
    useState<ProductDraft>(emptyProductDraft);
  const [journalDraft, setJournalDraft] =
    useState<JournalDraft>(emptyJournalDraft);

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

  function commit(nextContent: AequalisContent) {
    writeStoredContent(nextContent);
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

            <label>
              Image path
              <input
                value={productDraft.imageUrl}
                onChange={(event) =>
                  setProductDraft({
                    ...productDraft,
                    imageUrl: event.target.value,
                  })
                }
                placeholder="/images/aequalis/featured-bag.png"
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
              <button type="button" disabled>
                Upload after storage setup
              </button>
            </div>

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
      ) : (
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

            <label>
              Image path
              <input
                value={journalDraft.imageUrl}
                onChange={(event) =>
                  setJournalDraft({
                    ...journalDraft,
                    imageUrl: event.target.value,
                  })
                }
                placeholder="/images/aequalis/journal-values.png"
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
              <button type="button" disabled>
                Upload after storage setup
              </button>
            </div>

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
      )}
    </main>
  );
}
