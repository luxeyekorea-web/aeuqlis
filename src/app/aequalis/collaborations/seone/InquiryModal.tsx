"use client";

import { useState, type FormEvent } from "react";
import styles from "./page.module.css";

type FormStatus = "idle" | "submitting" | "submitted" | "error";

const initialForm = {
  collaborationType: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

const inquiryTypeOptions = [
  { value: "brand-collaboration", label: "브랜드 협업" },
  { value: "artisan-series", label: "장인 시리즈" },
  { value: "retail-exclusive", label: "리테일 익스클루시브" },
  { value: "press-editorial", label: "프레스 / 에디토리얼" },
  { value: "partnership", label: "파트너십 제안" },
  { value: "other", label: "기타 문의" },
];

export default function InquiryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const lastSubmittedAt = Number(
      window.localStorage.getItem("aequalis-last-inquiry-at") ?? 0,
    );

    if (Date.now() - lastSubmittedAt < 30_000) {
      setStatus("error");
      setErrorMessage("이미 문의가 접수되었습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/aequalis-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          website: form.website,
          inquiry: {
            name: form.name,
            company: form.company,
            email: form.email,
            phone: form.phone,
            collaborationType: form.collaborationType,
            message: form.message,
            referenceUrl: "aequalis x seone",
            sourcePath: window.location.pathname,
          },
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "문의 접수에 실패했습니다.");
      }

      setStatus("submitted");
      setForm(initialForm);
      window.localStorage.setItem("aequalis-last-inquiry-at", String(Date.now()));
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "문의 접수에 실패했습니다.",
      );
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.inquiryButton}
        onClick={() => {
          setIsOpen(true);
          setStatus("idle");
          setErrorMessage("");
        }}
      >
        partnership inquiry <span aria-hidden="true">→</span>
      </button>

      {isOpen ? (
        <div className={styles.modalLayer} role="presentation">
          <div
            className={styles.modalBackdrop}
            onClick={() => setIsOpen(false)}
            role="presentation"
          />
          <section
            className={styles.inquiryModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
          >
            <div className={styles.modalHead}>
              <div>
                <span className={styles.eyebrow}>partnership inquiry</span>
                <h2 id="inquiry-title">협업 문의</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>

            {status === "submitted" ? (
              <div className={styles.confirmation}>
                <strong>문의가 접수되었습니다.</strong>
                <p>
                  이퀄리스 팀이 내용을 검토한 뒤, 남겨주신 이메일로 순차적으로
                  연락드리겠습니다.
                </p>
                <button type="button" onClick={() => setIsOpen(false)}>
                  Done
                </button>
              </div>
            ) : (
              <form className={styles.inquiryForm} onSubmit={submitInquiry}>
                <input
                  className={styles.honeypot}
                  value={form.website}
                  onChange={(event) =>
                    setForm({ ...form, website: event.target.value })
                  }
                  tabIndex={-1}
                  autoComplete="off"
                />
                <div className={styles.formGrid}>
                  <label className={styles.fullField}>
                    문의 유형
                    <select
                      required
                      value={form.collaborationType}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          collaborationType: event.target.value,
                        })
                      }
                    >
                      <option value="">문의 유형을 선택해주세요</option>
                      {inquiryTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    이름
                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    브랜드 / 회사
                    <input
                      value={form.company}
                      onChange={(event) =>
                        setForm({ ...form, company: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    이메일
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    연락처
                    <input
                      value={form.phone}
                      inputMode="tel"
                      pattern="[0-9+\-\s().]{7,30}"
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  문의 내용
                  <textarea
                    required
                    minLength={20}
                    maxLength={3000}
                    rows={7}
                    value={form.message}
                    onChange={(event) =>
                      setForm({ ...form, message: event.target.value })
                    }
                    placeholder="협업 방향, 제품군, 일정, 참고할 내용 등을 편하게 남겨주세요."
                  />
                </label>
                <div className={styles.formActions}>
                  <span aria-live="polite">
                    {status === "error" ? errorMessage : ""}
                  </span>
                  <button type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Submitting" : "Submit inquiry"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
