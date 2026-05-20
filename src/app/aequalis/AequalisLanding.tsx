"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  type AequalisContent,
  sortByDisplayOrder,
} from "@/lib/aequalisContent";
import styles from "./page.module.css";

const navItems = ["about", "collections", "collaborations", "journal", "shop"];
const heroBannerVideoUrl =
  "https://tqdkpyuavxnhuvuinivh.supabase.co/storage/v1/object/public/aequalis_images/hero-banner-20260519.mp4";
const heroMatrixImageUrl = "/images/aequalis/hero-matrix.png";
const heroPosterImageUrl =
  "https://tqdkpyuavxnhuvuinivh.supabase.co/storage/v1/object/public/aequalis_images/hero-symbol.png";
const collaborationDetailLinks: Record<string, string> = {
  "product-collab-seone": "/aequalis/collaborations/seone",
};

const matrixSymbols = [
  { mark: "=", title: "Essential Equality" },
  { mark: "-", title: "Sacred Reduction" },
  { mark: "+", title: "Grace Addition" },
  { mark: "||", title: "Parallel Existence" },
  { mark: "•", title: "Singular Origin" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <aside className={styles.sectionLabel}>
      <span>{children}</span>
      <i aria-hidden="true" />
    </aside>
  );
}

export default function AequalisLanding({
  content,
}: {
  content: AequalisContent;
}) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroSoundOn, setIsHeroSoundOn] = useState(false);

  const collaborations = useMemo(
    () =>
      sortByDisplayOrder(
        content.products.filter(
          (product) => product.isActive && product.category === "collaboration",
        ),
      ),
    [content.products],
  );

  const featuredProducts = useMemo(
    () =>
      sortByDisplayOrder(
        content.products.filter(
          (product) => product.isActive && product.category === "featured",
        ),
      ),
    [content.products],
  );

  const journalPosts = useMemo(
    () => sortByDisplayOrder(content.journals.filter((post) => post.isActive)),
    [content.journals],
  );

  function toggleHeroSound() {
    const video = heroVideoRef.current;

    if (!video) {
      return;
    }

    const shouldTurnOn = video.muted;
    video.muted = !shouldTurnOn;
    video.volume = shouldTurnOn ? 1 : 0;
    setIsHeroSoundOn(shouldTurnOn);

    if (shouldTurnOn) {
      void video.play();
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.headerLogo} href="#top" aria-label="aequalis home">
          <img
            src="/images/aequalis/logo-header.png"
            alt="aequalis"
            width={150}
            height={44}
          />
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item} href={`#${item}`}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <img
              className={styles.heroLogo}
              src="/images/aequalis/logo-hero.png"
              alt="aequalis"
              width={286}
              height={122}
            />
            <h1>the essence of equality</h1>
            <p className={styles.koreanTitle}>동등함의 본질</p>
            <p className={styles.statement}>
              We stand equal before God.
              <br />
              Hierarchy is human-made.
              <br />
              Essence does not change.
              <br />
              We are neither above nor below-
              <br />
              we exist in parallel.
            </p>
            <div className={styles.heroMatrixImage}>
              <img
                src={heroMatrixImageUrl}
                alt="Essential Equality, Sacred Reduction, Grace Addition, Parallel Existence, Singular Origin"
                width={608}
                height={78}
              />
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroMediaFrame}>
              <video
                ref={heroVideoRef}
                className={styles.heroVideo}
                autoPlay
                muted={!isHeroSoundOn}
                loop
                playsInline
                poster={heroPosterImageUrl}
              >
                <source src={heroBannerVideoUrl} type="video/mp4" />
              </video>
              <button
                className={styles.heroSoundButton}
                type="button"
                aria-label={isHeroSoundOn ? "Mute hero video" : "Play hero video sound"}
                aria-pressed={isHeroSoundOn}
                onClick={toggleHeroSound}
              >
                {isHeroSoundOn ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    focusable="false"
                  >
                    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                    <path d="M16 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    focusable="false"
                  >
                    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                    <path d="m17 9 4 4m0-4-4 4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.about} id="about">
        <SectionLabel>about aequalis</SectionLabel>
        <div className={styles.aboutBody}>
          <h2>
            aequalis creates collections through shared design,{" "}
            <br />
            parallel values, and meaningful collaboration.
          </h2>
          <i aria-hidden="true" />
          <p>
            이퀄리스는 장인, 브랜드, 유통사와 함께{" "}
            <br />
            기획하고 디자인하는 협업형 디자인 플랫폼입니다.
          </p>
        </div>
        <img
          className={styles.aboutBird}
          src="/images/aequalis/bird-small.png"
          alt=""
          width={105}
          height={110}
        />
      </section>

      <section className={styles.contentBand} id="collaborations">
        <SectionLabel>
          collaboration
          <br />
          matrix
        </SectionLabel>
        <div className={styles.cardGrid}>
          {collaborations.length > 0 ? (
            collaborations.map((item) => (
              <a
                className={styles.collabCard}
                href={collaborationDetailLinks[item.id] ?? item.linkUrl}
                key={item.id}
              >
                <div className={styles.imageFrame}>
                  <Image src={item.imageUrl} alt="" width={235} height={225} />
                </div>
                <div className={styles.cardText}>
                  <h3>{item.title}</h3>
                  <p>
                    {[item.subtitle, item.description]
                      .filter(Boolean)
                      .map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                  </p>
                  <span className={styles.cardAction}>
                    Detail view
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            ))
          ) : (
            <p className={styles.emptyState}>No active collaboration products.</p>
          )}
        </div>
      </section>

      <section className={styles.symbolSystem} id="symbols">
        <SectionLabel>
          matrix symbol
          <br />
          system
        </SectionLabel>
        <div className={styles.symbolGrid}>
          {matrixSymbols.map((symbol) => (
            <a href="#about" className={styles.symbolTile} key={symbol.title}>
              <div>
                <span>[</span>
                <strong>{symbol.mark}</strong>
                <span>]</span>
              </div>
              <p>{symbol.title}</p>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.contentBand} id="collections">
        <SectionLabel>
          featured
          <br />
          collection
        </SectionLabel>
        <div className={styles.productGrid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((item) => (
              <a className={styles.collabCard} href={item.linkUrl} key={item.id}>
                <div className={styles.imageFrame}>
                  <Image src={item.imageUrl} alt="" width={235} height={225} />
                </div>
                <div className={styles.cardText}>
                  <h3>{item.title}</h3>
                  <p>
                    {[item.subtitle, item.description || "foundation collection"]
                      .filter(Boolean)
                      .map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                  </p>
                  <span className={styles.cardAction}>
                    Detail view
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            ))
          ) : (
            <p className={styles.emptyState}>No active featured products.</p>
          )}
        </div>
      </section>

      <section className={styles.journal} id="journal">
        <SectionLabel>journal</SectionLabel>
        <div className={styles.journalGrid}>
          {journalPosts.length > 0 ? (
            journalPosts.map((post) => (
              <a className={styles.journalCard} href={post.linkUrl} key={post.id}>
                <Image src={post.imageUrl} alt="" width={238} height={170} />
                <div>
                  <h3>{post.title}</h3>
                  <i aria-hidden="true" />
                  <p>{post.summary}</p>
                  <span>
                    read more <b aria-hidden="true">→</b>
                  </span>
                </div>
              </a>
            ))
          ) : (
            <p className={styles.emptyState}>No active journal posts.</p>
          )}
        </div>
      </section>

      <footer className={styles.footer} id="shop">
        <div className={styles.footerBrand}>
          <img
            src="/images/aequalis/logo-footer.png"
            alt="aequalis"
            width={134}
            height={74}
          />
          <p>
            collaborative design platform
            <br />
            the essence of equality
          </p>
          <i aria-hidden="true" />
          <p>
            Shared design for artisans,
            <br />
            brands, retailers, and communities.
          </p>
        </div>

        <div className={styles.footerColumns}>
          <nav aria-label="Footer primary">
            <a href="#about">about</a>
            <a href="#collections">collections</a>
            <a href="#collaborations">collaborations</a>
            <a href="#journal">journal</a>
            <a href="#shop">shop</a>
          </nav>
          <nav aria-label="Collection categories">
            <a href="#collections">artisan series</a>
            <a href="#collaborations">brand collaboration</a>
            <a href="#collaborations">retail exclusive</a>
            <a href="#collections">foundation line</a>
          </nav>
          <nav aria-label="Contact">
            <a href="mailto:hello@aequalis.com">contact</a>
            <a href="#collaborations">partnerships</a>
            <a href="#journal">instagram</a>
            <a href="#journal">newsletter</a>
            <span>hello@aequalis.com</span>
          </nav>
        </div>
        <img
          className={styles.footerBird}
          src="/images/aequalis/bird-small-foot.png"
          alt=""
          width={105}
          height={110}
        />
        <div className={styles.legal}>
          <span>© 2026 aequalis. all rights reserved.</span>
          <a href="#shop">privacy policy</a>
          <a href="#shop">terms</a>
        </div>
      </footer>
    </main>
  );
}
