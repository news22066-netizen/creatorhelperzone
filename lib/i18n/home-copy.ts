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
    business: { name: string; tag: string; points: string[]; cta: string };
    freeNote: string;
    pricingLink: string;
  };
  faq: { kicker: string; title: string; items: { q: string; a: string }[]; more: string };
  final: {
    title: string;
    sub: string;
    ctaCreator: string;
    ctaBusiness: string;
    pricingLink: string;
    perks: string[];
  };
  faqPricingLink: string;
}

const bn: HomeCopy = {
  hero: {
    kicker: "বাংলাদেশি ক্রিয়েটর ও ব্যবসার জন্য, ফ্রি",
    pre: "ফেসবুক, ইউটিউব আর হোয়াটসঅ্যাপ — সব ",
    hl: "এক লিংকে",
    post: "",
    sub: "নিজের নামে পাবলিক পেজ খুলুন, অথবা ব্যবসার জন্য হোয়াটসঅ্যাপে অর্ডার নেওয়া স্টোর বানান। দুটোই চালু আছে, ফ্রি, আর বাংলাদেশের কথা ভেবে বানানো।",
    ctaPrimary: "ফ্রি পেজ বানান",
    ctaSecondary: "ফ্রি টুলস দেখুন",
    urlLabel: "bfeed.store/yourname",
  },
  trust: {
    items: [
      { title: "সারাজীবন ফ্রি", desc: "পেজ আর স্টোরের জন্য কোনো সাবস্ক্রিপশন লাগে না।" },
      { title: "বাংলাদেশের জন্য", desc: "বাংলা ইন্টারফেস, আর হোয়াটসঅ্যাপে সরাসরি যোগাযোগ।" },
      { title: "এক মিনিটে চালু", desc: "ইউজারনেম বেছে নিন, তথ্য দিন, লিংক শেয়ার করুন।" },
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
        desc: "ইউজারনেম ঠিক করুন, নাম-ছবি-বায়ো দিন। ক্রিয়েটর হলে লিংক, কাজ আর প্রাইস যোগ করুন। ব্যবসা হলে পণ্য আর ক্যাটাগরি।",
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
      { title: "ব্যবসার অনলাইন স্টোর", desc: "bfeed.store/আপনার-শপ। পণ্য, ক্যাটাগরি, ছবি আর দাম সাজান। অর্ডার আসে হোয়াটসঅ্যাপে।" },
      { title: "হোয়াটসঅ্যাপ বাটন", desc: "ভিজিটর এক ট্যাপেই মেসেজ করতে পারবে, পণ্যের তথ্য আগে থেকে লেখা অবস্থায়।" },
      { title: "কাজ আর প্রাইস", desc: "ক্রিয়েটর হিসেবে প্রজেক্ট, ভিডিও আর প্যাকেজ দেখান। প্রাইস নিয়ে কথা হয় হোয়াটসঅ্যাপে।" },
      { title: "ফ্রি টুলস", desc: "কনটেন্ট ক্রিয়েটরদের কাজের জন্য বাছাই করা ফ্রি টুলস, এক জায়গায়।" },
      { title: "ট্রেন্ডিং আর গাইড", desc: "এ সপ্তাহে বাংলাদেশে কী চলছে, সঙ্গে অডিয়েন্স বাড়ানো আর বিক্রির বাংলা গাইড।" },
    ],
  },
  tools: {
    kicker: "জনপ্রিয় টুলস",
    title: "আজই কাজে লাগান",
    seeAll: "সব টুলস দেখুন",
    empty: "এখনো কোনো টুল তালিকায় নেই।",
  },
  audience: {
    kicker: "আপনার জন্য কোনটা",
    title: "ক্রিয়েটর বা ব্যবসা, দুটোর জন্যই সবকিছু চালু",
    creator: {
      name: "ক্রিয়েটর",
      tag: "YouTube, Facebook, TikTok, Instagram",
      points: [
        "bfeed.store/আপনার-নাম পেজ সাইন আপ করার সাথে সাথেই চালু",
        "নিজের কাজ আর ভিডিও দেখান, প্যাকেজের প্রাইস সাজিয়ে রাখুন",
        "ব্র্যান্ড বা ক্লায়েন্ট এক ট্যাপে হোয়াটসঅ্যাপে মেসেজ করবে, প্রাইস নিয়ে সেখানেই কথা",
        "ড্যাশবোর্ডেই ফ্রি টুলস, ট্রেন্ডিং আইডিয়া আর বাংলা গাইড",
      ],
      cta: "ক্রিয়েটর হিসেবে শুরু করুন",
    },
    business: {
      name: "ছোট ব্যবসা",
      tag: "শপ, কোর্স বা সার্ভিস",
      points: [
        "নিজের অনলাইন স্টোর: পণ্য, ক্যাটাগরি, ছবি আর দাম, সবই আপনার কন্ট্রোলে",
        "কাস্টমার হোয়াটসঅ্যাপে অর্ডার করবে, পণ্যের তথ্য আগে থেকেই লেখা থাকবে",
        "শপের FAQ, যোগাযোগের লিংক, স্টোরের রং আর প্রাইভেসি পেজ ড্যাশবোর্ড থেকেই বদলানো যায়",
        "কোনো সাবস্ক্রিপশন নেই, অর্ডার থেকে কোনো কমিশনও নেই",
      ],
      cta: "ব্যবসা হিসেবে শুরু করুন",
    },
    freeNote: "সারাজীবন ফ্রি।",
    pricingLink: "কী কী ফ্রি দেখুন",
  },
  faq: {
    kicker: "প্রশ্ন-উত্তর",
    title: "যা জানতে চান",
    items: [
      {
        q: "সত্যিই কি ফ্রি?",
        a: "হ্যাঁ, আর এটা এভাবেই থাকবে। পাবলিক পেজ, ব্যবসার স্টোর, হোয়াটসঅ্যাপ বাটন, টুলস আর গাইড সারাজীবন ফ্রি। ভবিষ্যতে ব্যাজ বা নিজের ডোমেইনের মতো ঐচ্ছিক কিছু এলে সেটা আগে জানানো হবে, আর তা না নিলেও আপনার পেজ-স্টোর আগের মতোই চলবে।",
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
        a: "ক্রিয়েটর পান লিংক, কাজ, ভিডিও আর প্রাইস প্যাকেজসহ পাবলিক পেজ। ব্যবসা পায় পণ্য আর ক্যাটাগরিসহ অনলাইন স্টোর। দুটোতেই হোয়াটসঅ্যাপ বাটন আর ফ্রি ড্যাশবোর্ড আছে।",
      },
      {
        q: "কাস্টমার কীভাবে অর্ডার করে?",
        a: "ব্যবসার স্টোর চালু আছে। কাস্টমার পণ্য বেছে নিলে পণ্যের তথ্যসহ মেসেজ আপনার হোয়াটসঅ্যাপে চলে যায়। এখানে পেমেন্ট গেটওয়ে নেই আর আমরা কোনো কমিশন নিই না। দাম আর পেমেন্ট আপনি কাস্টমারের সাথে সরাসরি ঠিক করেন।",
      },
    ],
    more: "সব প্রশ্ন দেখুন",
  },
  faqPricingLink: "প্রাইসিং পেজ দেখুন",
  final: {
    title: "নামটা আজই নিয়ে রাখুন",
    sub: "ইউজারনেম যে আগে নেয়, সে-ই পায়। এক মিনিটে পেজ বা স্টোর খুলুন, কার্ড বা পেমেন্ট কিছুই লাগবে না।",
    ctaCreator: "ক্রিয়েটর হিসেবে শুরু করুন",
    ctaBusiness: "ব্যবসা হিসেবে শুরু করুন",
    pricingLink: "কী কী ফ্রি, দেখুন",
    perks: ["সারাজীবন ফ্রি", "কমিশন নেই", "হোয়াটসঅ্যাপে সরাসরি অর্ডার"],
  },
};

const en: HomeCopy = {
  hero: {
    kicker: "Free for Bangladeshi creators and businesses",
    pre: "Facebook, YouTube and WhatsApp, all on ",
    hl: "one link",
    post: "",
    sub: "Get a public page in your own name, or open a store that takes orders on WhatsApp. Both are live, free, and built for Bangladesh.",
    ctaPrimary: "Make your free page",
    ctaSecondary: "Explore free tools",
    urlLabel: "bfeed.store/yourname",
  },
  trust: {
    items: [
      { title: "Free forever", desc: "No subscription for your page or your store." },
      { title: "Made for Bangladesh", desc: "Bangla interface and WhatsApp-first contact." },
      { title: "Live in a minute", desc: "Pick a username, add your details, share the link." },
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
      { title: "Set up your page", desc: "Pick a username, add name, photo and bio. Creators add links, works and prices. Businesses add products and categories." },
      { title: "Share the link", desc: "Put it in your Facebook bio, YouTube description or status. One link for everything." },
    ],
  },
  features: {
    kicker: "What you get",
    title: "One page, everything you need",
    items: [
      { title: "A link with your name", desc: "bfeed.store/your-name. Short, easy to remember, works anywhere." },
      { title: "A store for your business", desc: "bfeed.store/yourshop with products, categories, photos and prices. Orders arrive on WhatsApp." },
      { title: "WhatsApp button", desc: "Visitors message you in one tap, with the product details already written." },
      { title: "Works and prices", desc: "Creators show projects, videos and plans. People ask about pricing on WhatsApp." },
      { title: "Free tools", desc: "Free tools picked for content creators, in one place." },
      { title: "Trending and guides", desc: "What is moving in Bangladesh this week, plus practical guides on growing and selling." },
    ],
  },
  tools: {
    kicker: "Popular tools",
    title: "Start using them today",
    seeAll: "See all tools",
    empty: "No tools are listed yet.",
  },
  audience: {
    kicker: "Which one is you",
    title: "Creator or business, both are live",
    creator: {
      name: "Creator",
      tag: "YouTube, Facebook, TikTok, Instagram",
      points: [
        "Your page at bfeed.store/yourname, live the moment you sign up",
        "Show your works and videos, and keep your plans and prices ready",
        "Brands and clients message you on WhatsApp in one tap, and talk pricing there",
        "Free tools, trending ideas and Bangla guides inside your dashboard",
      ],
      cta: "Start as a creator",
    },
    business: {
      name: "Small business",
      tag: "Shop, course or service",
      points: [
        "Your own online store: products, categories, photos and prices, all in your control",
        "Customers order on WhatsApp with the product details already filled in",
        "Shop FAQ, contact links, store colours and a privacy page, all edited from your dashboard",
        "No subscription and no commission on your orders",
      ],
      cta: "Start as a business",
    },
    freeNote: "Free forever.",
    pricingLink: "See what is included",
  },
  faq: {
    kicker: "FAQ",
    title: "What people ask",
    items: [
      {
        q: "Is it really free?",
        a: "Yes, and it stays that way. Your public page, business store, WhatsApp buttons, tools and guides are free forever. If optional extras like a badge or a custom domain ever arrive, they will be optional and announced first, and your page and store keep working the same without them.",
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
        a: "Creators get a public page with links, works, videos and price plans. Businesses get an online store with products and categories. Both get a WhatsApp button and a free dashboard.",
      },
      {
        q: "How do customers order?",
        a: "Business stores are live. A customer picks a product and a message with its details lands in your WhatsApp. There is no payment gateway and we take no commission: you settle price and payment with the customer directly.",
      },
    ],
    more: "See all questions",
  },
  faqPricingLink: "See the pricing page",
  final: {
    title: "Claim your name today",
    sub: "Usernames are first come, first served. Open your page or store in a minute, no card and no payment.",
    ctaCreator: "Start as a creator",
    ctaBusiness: "Start as a business",
    pricingLink: "See what is free",
    perks: ["Free forever", "No commission", "Orders straight to WhatsApp"],
  },
};

export const homeCopy: Record<Lang, HomeCopy> = { bn, en };
