const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: false,

  // ── 인사말과 Love Story 사이 고정 이미지 ──
  introFixedImage: {
    enabled: true,
    src: "images/intro/between-greeting-story.jpg",
    alt: "규현과 민지 웨딩 사진",
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "0 24px",
    radius: "0px",
    objectFit: "contain",
    objectPosition: "center center"
  },

  // ── 메인 (히어로) ──
  groom: {
    name: "이규현",
    father: "이홍열",
    mother: "권미숙",
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "신민지",
    father: "신정호",
    mother: "노미화",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-08-02",
    time: "11:00",
    venue: "아펠가모 공덕",
    hall: "라로브홀 7층",
    address: "서울특별시 마포대로92, 효성헤링턴스퀘어 B동",
    tel: "02-2197-0230",
    mapLinks: {
      kakao: "https://kko.to/lnbjOw_ws6",
      naver: "https://naver.me/GYDc9MvY"
    }
  },

  // ── 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content: "작은 대화 속에서도\n서로의 내일을 자연스럽게 떠올리던 저희가\n이제 평생을 함께하기로 약속했습니다.\n\n저희 두사람의 소중한 첫걸음을\n따뜻한 마음으로 지켜봐 주신다면\n더없이 큰 기쁨과 감사가 되겠습니다."
  },

  // ── 우리의 이야기 ──
  story: {
    title: "Love Story",
    content: ""
  },

  // ── 마음 전하실 곳 ──
  accounts: {
    notice: "식장의 규정에 따라 화환은 정중히 사양합니다.\n축하의 마음만 감사히 받겠습니다.",

    groom: [
      { role: "신랑", name: "이규현", bank: "국민은행", number: "387202-01-112227" },
      { role: "아버지", name: "이홍열", bank: "우리은행", number: "1002-529-158996" },
      { role: "어머니", name: "권미숙", bank: "농협은행", number: "1147-02-072345" }
    ],
    bride: [
      { role: "신부", name: "신민지", bank: "카카오뱅크", number: "3333-05-0316406" },
      { role: "아버지", name: "신정호", bank: "농협은행", number: "302-0203-7710-61" },
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "규현 ♥ 민지 결혼합니다",
    description: "2026년 8월 2일 11:00, 아펠가모 공덕 라로브홀 ."
  }
};
