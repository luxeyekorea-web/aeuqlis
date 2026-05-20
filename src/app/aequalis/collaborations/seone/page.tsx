import Image from "next/image";
import type { Metadata } from "next";
import InquiryModal from "./InquiryModal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "aequalis x seone | collaboration detail",
  description:
    "이퀄리스와 서네가 함께한 수제화 협업 상세 페이지입니다.",
  openGraph: {
    title: "aequalis x seone | collaboration detail",
    description: "성수 수제화 장인의 감각과 이퀄리스의 협업 철학을 담은 프로젝트입니다.",
    images: ["/images/aequalis/seone-lasts-study.png"],
  },
};

const principles = [
  {
    mark: "=",
    title: "Equal ground",
    body: "디자인 방향과 장인의 손기술은 어느 한쪽이 앞서지 않습니다. 사용성, 비례, 조용한 아름다움이라는 같은 기준 위에서 모든 결정을 맞춥니다.",
  },
  {
    mark: "-",
    title: "Reduced excess",
    body: "착용자에게 필요하지 않은 장식은 덜어내고, 신발의 선과 소재가 스스로 말할 수 있도록 형태를 정제합니다.",
  },
  {
    mark: "||",
    title: "Parallel making",
    body: "이퀄리스는 오브젝트의 언어를 설계하고, 서네는 오랜 피팅과 재단, 마감의 경험으로 구조를 세밀하게 완성합니다.",
  },
];

const details = [
  "서울 성수를 기반으로 한 수제화 제작 스튜디오",
  "30년 가까이 축적된 슈즈 마스터의 제작 경험",
  "정교한 마감, 착화감, 사용자 중심 구조에 대한 깊은 이해",
  "동시대 패션 브랜드 및 하우스와 이어온 다양한 협업 이력",
];

export default function SeoneCollaborationPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/aequalis" className={styles.logoLink} aria-label="aequalis home">
          <Image
            src="/images/aequalis/logo-header.png"
            alt="aequalis"
            width={150}
            height={44}
          />
        </a>
        <nav className={styles.nav} aria-label="Detail navigation">
          <a href="/aequalis#collaborations">collaborations</a>
          <a href="/aequalis#collections">collections</a>
          <a href="/aequalis#journal">journal</a>
          <a href="mailto:hello@aequalis.com">contact</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>collaboration detail</span>
          <h1>aequalis x seone</h1>
          <p className={styles.kicker}>서네와 함께한 수제화 협업</p>
          <p className={styles.lede}>
            실루엣과 착화감, 장인의 손기술을 같은 무게로 다루는 수제화
            협업입니다. 서네는 성수 수제화의 축적된 감각을 이퀄리스의
            협업 구조 안으로 가져옵니다.
          </p>
          <div className={styles.metaGrid} aria-label="collaboration facts">
            <span>Partner</span>
            <b>서네, 서울 성수</b>
            <span>Field</span>
            <b>수제화 제작</b>
            <span>Mode</span>
            <b>장인 협업</b>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/images/aequalis/seone-lasts-study.png"
            alt="검은 더비 슈즈와 라스트, 제작 도구가 놓인 서네 수제화 작업대"
            width={720}
            height={690}
            priority
          />
        </div>
      </section>

      <section className={styles.statement}>
        <aside>
          <span>01</span>
          <b>project intention</b>
        </aside>
        <div>
          <h2>
            조용한 신발 안에도 수많은 손의 기준이 남아 있습니다.
          </h2>
          <p>
            이 협업은 형태와 편안함이 서로 경쟁하지 않아도 된다는 믿음에서
            출발합니다. 이퀄리스는 서네와 함께 패턴, 균형, 가죽, 착용의
            언어를 천천히 맞춰갑니다. 결과물은 장식적인 오브젝트가 아니라,
            신는 사람의 하루를 안정적으로 받쳐주는 물건에 가깝습니다.
          </p>
        </div>
      </section>

      <section className={styles.partner}>
        <div className={styles.partnerImage}>
          <Image
            src="/images/aequalis/seone-stitch-detail.png"
            alt="검은 가죽 신발의 스티치와 수제화 제작 도구 클로즈업"
            width={680}
            height={520}
          />
        </div>
        <div className={styles.partnerCopy}>
          <span className={styles.eyebrow}>partner profile</span>
          <h2>Seone, footwear master from Seongsu.</h2>
          <p>
            서네는 성수동을 기반으로 오랜 시간 수제화의 구조와 착화감을
            다듬어온 슈즈 마스터입니다. WELLDONE, WOOYOUNGMI, YUJI 등 여러
            동시대 패션 하우스와의 협업을 통해, 완성도와 실용성을 함께 다루는
            장인의 기준을 보여주어 왔습니다.
          </p>
          <ul>
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.principles}>
        <div className={styles.sectionHead}>
          <span>02</span>
          <h2>matrix principles</h2>
        </div>
        <div className={styles.principleGrid}>
          {principles.map((item) => (
            <article key={item.title}>
              <strong>[ {item.mark} ]</strong>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.gallery}>
        <div className={styles.galleryLead}>
          <span>03</span>
          <h2>material, proportion, use</h2>
          <p>
            이미지는 과장된 연출보다 소재와 선, 구조가 드러나는 방식으로
            구성했습니다. 하나의 제품 사진이면서 동시에 협업의 기록이 되도록,
            표면과 가장자리, 제작 도구의 질감을 차분하게 남깁니다.
          </p>
        </div>
        <div className={styles.galleryGrid}>
          <Image
            src="/images/aequalis/seone-workshop.png"
            alt="나무 라스트, 종이 패턴, 검은 가죽 패널과 완성된 신발"
            width={520}
            height={520}
          />
          <Image
            src="/images/aequalis/seone-stitch-detail.png"
            alt="검은 가죽 신발의 스티치 디테일"
            width={520}
            height={520}
          />
          <Image
            src="/images/aequalis/seone-lasts-study.png"
            alt="서네 수제화 작업실 정물 이미지"
            width={520}
            height={520}
          />
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}>next step</span>
          <h2>같은 깊이의 협업을 준비하고 있다면.</h2>
        </div>
        <InquiryModal />
      </section>

      <footer className={styles.footer}>
        <a href="/aequalis#collaborations">Back to collaborations</a>
        <span>© 2026 aequalis</span>
      </footer>
    </main>
  );
}
