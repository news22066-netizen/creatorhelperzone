import type { Lang } from "./dictionary";

type Item = { title: string; desc: string };

export interface HomeCopy {
  hero: {
    kicker: string;
    pre: string;
    hl: string;
    post: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    urlLabel: string;
  };
  trust: { items: Item[]; toolsTitle: string; toolsTitleFallback: string; toolsDesc: string };
  how: { kicker: string; title: string; steps: Item[] };
  features: { kicker: string; title: string; items: Item[] };
  tools: { kicker: string; title: string; seeAll: string; empty: string };
  audience: {
    kicker: string;
    title: string;
    creator: { name: string; tag: string; points: string[]; cta: string };
    business: { name: string; tag: string; points: string[]; soon: string; soonLabel: string; cta: string };
  };
  faq: { kicker: string; title: string; items: { q: string; a: string }[]; more: string };
  final: { title: string; sub: string; ctaPrimary: string; ctaSecondary: string };
}

const bn: HomeCopy = {
  hero: {
    kicker: "বাংলাদেশি ক্রিয়েটর ও ছোট ব্যবসার জন্য",
    pre: "ফেসবুক, ইউটিউব আর হোয়াটসঅ্যাপ — সব ",
    hl: "এক লিংকে",
    post: "",
    sub: "নিজের নামে একটা পাবলিক পেজ বানান। লিংক সাজান, হোয়াটসঅ্যাপ বাটন বসান, আর কনটেন্টের কাজে লাগে এমন ফ্রি টুলস ব্যবহার করুন। শুরু করতে কোনো পেমেন্ট লাগে না।",
    ctaPrimary: "ফ্রি পেজ বানান",
    ctaSecondary: "ফ্রি টুলস দেখুন",
    urlLabel: "bfeed.store/yourname",
  },
  trust: {
    items: [
      { title: "ফ্রিতে শুরু", desc: "পেজ বানাতে ও টুলস ব্যবহারে কোনো পেমেন্ট নেই।" },
      { title: "বাংলাদেশের জন্য", desc: "বাংলা ইন্টারফেস, আর হোয়াটসঅ্যাপে সরাসরি যোগাযোগ।" },
      { title: "এক মিনিটে সেটআপ", desc: "ইউজারনেম বেছে নিন, লিংক যোগ করুন, শেয়ার করুন।" },
    ],
    toolsTitle: "{n}+ ফ্রি টুলস",
    toolsTitleFallback: "বাছাই করা ফ্রি টুলস",
    toolsDesc: "ক্রিয়েটরদের কাজের জন্য, এক জায়গায়।",
  },
  how: {
    kicker: "কীভাবে কাজ করে",
    title: "তিন ধাপে আপনার পেজ রেডি",
    steps: [
      {
        title: "অ্যাকাউন্ট খুলুন",
        desc: "ইমেইল বা Google দিয়ে সাইন আপ করুন। আপনি ক্রিয়েটর নাকি ব্যবসা, সেটা বেছে নিন।",
      },
      {
        title: "পেজ সাজান",
        desc: "ইউজারনেম ঠিক করুন, নাম-ছবি-বায়ো দিন, লিংক আর হোয়াটসঅ্যাপ নম্বর যোগ করুন।",
      },
      {
        title: "লিংকটা শেয়ার করুন",
        desc: "পেজের লিংক বসান ফেসবুক বায়ো, ইউটিউব ডেসক্রিপশন বা স্ট্যাটাসে। আর কোনো লিংক আলাদা করে দিতে হবে না।",
      },
    ],
  },
  features: {
    kicker: "যা যা পাবেন",
    title: "একটা পেজ, কাজের সব জিনিস",
    items: [
      { title: "নিজের নামের লিংক", desc: "bfeed.store/আপনার-নাম। ছোট, মনে রাখা সহজ, যেকোনো জায়গায় বসানো যায়।" },
      { title: "লিংক সাজান নিজের মতো", desc: "ফেসবুক, ইউটিউব, টিকটক, ওয়েবসাইট। কোনটা আগে দেখাবেন, ওপর-নিচ করে ঠিক করুন।" },
      { title: "হোয়াটসঅ্যাপ বাটন", desc: "ভিজিটর এক ট্যাপেই আপনাকে মেসেজ করতে পারবে, আগে থেকে লেখা মেসেজসহ।" },
      { title: "ফ্রি টুলস", desc: "কনটেন্ট ক্রিয়েটরদের কাজের জন্য বাছাই করা ফ্রি টুলস, এক জায়গায়।" },
      { title: "সাপ্তাহিক ট্রেন্ডিং", desc: "এ সপ্তাহে বাংলাদেশে কী চলছে: ট্রেন্ডিং কনটেন্ট, কিওয়ার্ড আর থাম্বনেইল আইডিয়া।" },
      { title: "বাংলা গাইড", desc: "অডিয়েন্স বাড়ানো আর অনলাইনে বিক্রি করার কাজের গাইড।" },
    ],
  },
  tools: {
    kicker: "জনপ্রিয় টুলস",
    title: "আজই কাজে লাগান",
    seeAll: "সব টুলস দেখুন",
    empty: "টুলস শীঘ্রই যোগ হচ্ছে।",
  },
  audience: {
    kicker: "আপনার জন্য কোনটা",
    title: "ক্রিয়েটর হোন বা ব্যবসায়ী, পেজ একটাই",
    creator: {
      name: "ক্রিয়েটর",
      tag: "YouTube, Facebook, TikTok, Instagram",
      points: [
        "সব প্ল্যাটফর্মের লিংক এক পেজে, বায়োতে শুধু একটা লিংক",
        "ব্র্যান্ড বা ফ্যান হোয়াটসঅ্যাপে সরাসরি মেসেজ করতে পারবে",
        "ট্রেন্ডিং আইডিয়া আর ফ্রি টুলস হাতের কাছে",
      ],
      cta: "ক্রিয়েটর হিসেবে শুরু করুন",
    },
    business: {
      name: "ছোট ব্যবসা",
      tag: "শপ, কোর্স বা সার্ভিস",
      points: [
        "ফেসবুক পেজ, শপ আর কোর্সের লিংক এক ঠিকানায়",
        "কাস্টমার হোয়াটসঅ্যাপে অর্ডার বা প্রশ্ন পাঠাতে পারবে",
        "বিজ্ঞাপন বা পোস্টে একটাই লিংক দিলেই চলবে",
      ],
      soon: "অনলাইন স্টোর",
      soonLabel: "শীঘ্রই",
      cta: "ব্যবসা হিসেবে শুরু করুন",
    },
  },
  faq: {
    kicker: "প্রশ্ন-উত্তর",
    title: "যা জানতে চান",
    items: [
      {
        q: "সত্যিই কি ফ্রি?",
        a: "হ্যাঁ। এখন পেজ বানানো আর টুলস ব্যবহারে কোনো পেমেন্ট লাগে না। ভবিষ্যতে পেইড ফিচার এলে আগে থেকেই জানিয়ে দেওয়া হবে।",
      },
      {
        q: "আমার পেজের লিংক কেমন হবে?",
        a: "bfeed.store/আপনার-ইউজারনেম। ইউজারনেম হবে ইংরেজি ছোট হাতের অক্ষর (a-z), সংখ্যা আর _ দিয়ে, ৩ থেকে ৩০ অক্ষরের মধ্যে।",
      },
      {
        q: "ইউজারনেম পরে বদলানো যাবে?",
        a: "এখন ইউজারনেম স্থায়ী। তাই সাইন আপের সময় ভেবে বেছে নিন। বিশেষ কারণে বদলাতে চাইলে আমাদের সাথে যোগাযোগ করুন।",
      },
      {
        q: "ক্রিয়েটর আর ব্যবসা অ্যাকাউন্টে পার্থক্য কী?",
        a: "দুই ধরনেই আপনি লিংক, বায়ো আর হোয়াটসঅ্যাপ বাটনসহ পাবলিক পেজ পাবেন। সাইন আপের সময় আপনার কাজ অনুযায়ী একটা বেছে নিন।",
      },
      {
        q: "পেজে কি অনলাইন পেমেন্ট বা দোকান আছে?",
        a: "এখনো নেই। স্টোর আর কোলাবোরেশন বোর্ড আসছে। এখন লিংক আর হোয়াটসঅ্যাপ বাটন দিয়েই কাস্টমার আপনার কাছে পৌঁছাতে পারে।",
      },
    ],
    more: "সব প্রশ্ন দেখুন",
  },
  final: {
    title: "নামটা আজই নিয়ে রাখুন",
    sub: "ইউজারনেম যে আগে নেয়, সে-ই পায়। এক মিনিটে পেজ বানান, কোনো পেমেন্ট লাগবে না।",
    ctaPrimary: "ফ্রি পেজ বানান",
    ctaSecondary: "আগে টুলস দেখি",
  },
};

const en: HomeCopy = {
  hero: {
    kicker: "For Bangladeshi creators and small businesses",
    pre: "Facebook, YouTube and WhatsApp, all on ",
    hl: "one link",
    post: "",
    sub: "Make a public page in your own name. Arrange your links, add a WhatsApp button, and use free tools picked for content work. Nothing to pay to start.",
    ctaPrimary: "Make your free page",
    ctaSecondary: "Explore free tools",
    urlLabel: "bfeed.store/yourname",
  },
  trust: {
    items: [
      { title: "Free to start", desc: "No payment to build a page or use the tools." },
      { title: "Made for Bangladesh", desc: "Bangla interface and direct WhatsApp contact." },
      { title: "Set up in a minute", desc: "Pick a username, add your links, share." },
    ],
    toolsTitle: "{n}+ free tools",
    toolsTitleFallback: "Hand-picked free tools",
    toolsDesc: "For creator work, in one place.",
  },
  how: {
    kicker: "How it works",
    title: "Your page is ready in three steps",
    steps: [
      { title: "Create an account", desc: "Sign up with email or Google. Choose creator or business." },
      { title: "Set up your page", desc: "Pick a username, add name, photo and bio, then your links and WhatsApp number." },
      { title: "Share the link", desc: "Put it in your Facebook bio, YouTube description or status. One link for everything." },
    ],
  },
  features: {
    kicker: "What you get",
    title: "One page, everything you need",
    items: [
      { title: "A link with your name", desc: "bfeed.store/your-name. Short, easy to remember, works anywhere." },
      { title: "Links in your order", desc: "Facebook, YouTube, TikTok, your website. Move them up or down." },
      { title: "WhatsApp button", desc: "Visitors message you in one tap, with a ready-written message." },
      { title: "Free tools", desc: "Free tools picked for content creators, in one place." },
      { title: "Weekly trending", desc: "What is moving in Bangladesh: trending content, keywords and thumbnail ideas." },
      { title: "Guides", desc: "Practical guides on growing an audience and selling online." },
    ],
  },
  tools: {
    kicker: "Popular tools",
    title: "Start using them today",
    seeAll: "See all tools",
    empty: "Tools are being added soon.",
  },
  audience: {
    kicker: "Which one is you",
    title: "Creator or shop owner, one page",
    creator: {
      name: "Creator",
      tag: "YouTube, Facebook, TikTok, Instagram",
      points: [
        "All your platforms on one page, one link in your bio",
        "Brands and fans can message you on WhatsApp directly",
        "Trending ideas and free tools close at hand",
      ],
      cta: "Start as a creator",
    },
    business: {
      name: "Small business",
      tag: "Shop, course or service",
      points: [
        "Facebook page, shop and course links at one address",
        "Customers can send orders or questions on WhatsApp",
        "One link is enough for your ads and posts",
      ],
      soon: "Online store",
      soonLabel: "Soon",
      cta: "Start as a business",
    },
  },
  faq: {
    kicker: "FAQ",
    title: "What people ask",
    items: [
      {
        q: "Is it really free?",
        a: "Yes. Building a page and using the tools costs nothing right now. If paid features arrive later, we will announce them in advance.",
      },
      {
        q: "What will my page link look like?",
        a: "bfeed.store/your-username. Usernames use lowercase English letters (a-z), numbers and _, 3 to 30 characters.",
      },
      {
        q: "Can I change my username later?",
        a: "Usernames are permanent for now, so choose carefully when you sign up. If you have a special case, contact us.",
      },
      {
        q: "Creator vs business account: what is the difference?",
        a: "Both get a public page with links, bio and a WhatsApp button. Pick the one that matches your work when you sign up.",
      },
      {
        q: "Does the page have online payments or a shop?",
        a: "Not yet. The store and a collaboration board are coming. For now customers reach you through your links and the WhatsApp button.",
      },
    ],
    more: "See all questions",
  },
  final: {
    title: "Claim your name today",
    sub: "Usernames are first come, first served. Build your page in a minute, no payment needed.",
    ctaPrimary: "Make your free page",
    ctaSecondary: "Look at the tools first",
  },
};

export const homeCopy: Record<Lang, HomeCopy> = { bn, en };
