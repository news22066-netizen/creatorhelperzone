import type { Lang } from "./dictionary";

export interface PricingCopy {
  kicker: string;
  title: string;
  sub: string;
  priceLabel: string;
  priceNote: string;
  includedKicker: string;
  includedTitle: string;
  groups: { title: string; items: string[] }[];
  promiseKicker: string;
  promiseTitle: string;
  promises: { title: string; desc: string }[];
  laterTitle: string;
  laterBody: string;
  faqKicker: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaCreator: string;
  ctaBusiness: string;
  ctaTools: string;
}

const en: PricingCopy = {
  kicker: "Pricing",
  title: "Free. For good.",
  sub: "BFEED is completely free for creators and businesses. No subscription for your public page or your store, now or later.",
  priceLabel: "৳0",
  priceNote: "per month, for the core platform. No card needed.",
  includedKicker: "What is included",
  includedTitle: "Everything below is free",
  groups: [
    {
      title: "For everyone",
      items: [
        "Public page at bfeed.store/yourname",
        "WhatsApp buttons with ready-written messages",
        "Free tools directory, picked for content work",
        "Weekly trending content, keywords and thumbnail ideas",
        "Public guides plus video lessons in your dashboard",
        "Bangla and English interface",
      ],
    },
    {
      title: "For creators",
      items: [
        "Your links, bio and contact details in one place",
        "Works gallery with images and YouTube videos",
        "Price plans people can ask about on WhatsApp",
        "Latest videos section and page appearance options",
      ],
    },
    {
      title: "For businesses",
      items: [
        "Online store at bfeed.store/yourshop",
        "Products, categories, photos and prices",
        "Orders on WhatsApp with the product details filled in",
        "Shop FAQ, contact links, store colours and privacy page",
      ],
    },
  ],
  promiseKicker: "How it stays free",
  promiseTitle: "No catch, in plain words",
  promises: [
    { title: "No subscription", desc: "Your page and store do not expire and never ask for a monthly fee." },
    { title: "No commission", desc: "Orders happen on WhatsApp between you and your customer. We do not handle payments or take a cut." },
    { title: "No card to start", desc: "Sign up with email or Google and you are live. Nothing to enter, nothing to cancel." },
  ],
  laterTitle: "An honest note about later",
  laterBody:
    "We may add optional extras one day, such as a verified badge or a custom domain. If that happens they will be optional, announced before launch, and the core page and store will stay free exactly as they are today.",
  faqKicker: "Questions",
  faqTitle: "Pricing, answered",
  faq: [
    { q: "Is it really free forever?", a: "Yes for the core platform: your public page, business store, WhatsApp buttons, tools and guides. That is the promise." },
    { q: "Will you ask me to pay once I have customers?", a: "No. There is no usage limit that pushes you onto a paid plan, and no fee on orders." },
    { q: "Who pays for the platform?", a: "We keep running costs low on purpose. Any future income would come from optional extras, never from locking the core." },
  ],
  ctaCreator: "Start as a creator",
  ctaBusiness: "Start as a business",
  ctaTools: "Browse free tools",
};

const bn: PricingCopy = {
  kicker: "প্রাইসিং",
  title: "ফ্রি। সারাজীবন।",
  sub: "ক্রিয়েটর আর ব্যবসা, দুই ধরনের অ্যাকাউন্টের জন্যই BFEED পুরোপুরি ফ্রি। পাবলিক পেজ বা স্টোরের জন্য এখন বা পরে কোনো সাবস্ক্রিপশন নেই।",
  priceLabel: "৳০",
  priceNote: "প্রতি মাসে, মূল প্ল্যাটফর্মের জন্য। কার্ড লাগবে না।",
  includedKicker: "কী কী পাচ্ছেন",
  includedTitle: "নিচের সবকিছু ফ্রি",
  groups: [
    {
      title: "সবার জন্য",
      items: [
        "bfeed.store/আপনার-নাম ঠিকানায় পাবলিক পেজ",
        "আগে থেকে লেখা মেসেজসহ হোয়াটসঅ্যাপ বাটন",
        "কনটেন্টের কাজের জন্য বাছাই করা ফ্রি টুলস",
        "সাপ্তাহিক ট্রেন্ডিং কনটেন্ট, কিওয়ার্ড আর থাম্বনেইল আইডিয়া",
        "পাবলিক গাইড, সঙ্গে ড্যাশবোর্ডে ভিডিও লেসন",
        "বাংলা ও ইংরেজি ইন্টারফেস",
      ],
    },
    {
      title: "ক্রিয়েটরদের জন্য",
      items: [
        "লিংক, বায়ো আর যোগাযোগের তথ্য এক জায়গায়",
        "ছবি আর ইউটিউব ভিডিওসহ কাজের গ্যালারি",
        "প্রাইস প্ল্যান, যা নিয়ে হোয়াটসঅ্যাপে কথা বলা যায়",
        "সর্বশেষ ভিডিও সেকশন আর পেজের লুক বদলানোর অপশন",
      ],
    },
    {
      title: "ব্যবসার জন্য",
      items: [
        "bfeed.store/আপনার-শপ ঠিকানায় অনলাইন স্টোর",
        "পণ্য, ক্যাটাগরি, ছবি আর দাম",
        "পণ্যের তথ্যসহ হোয়াটসঅ্যাপে অর্ডার",
        "শপের FAQ, যোগাযোগের লিংক, স্টোরের রং আর প্রাইভেসি পেজ",
      ],
    },
  ],
  promiseKicker: "ফ্রি থাকে কীভাবে",
  promiseTitle: "সহজ কথায়, কোনো শর্ত নেই",
  promises: [
    { title: "সাবস্ক্রিপশন নেই", desc: "পেজ বা স্টোরের মেয়াদ ফুরায় না, মাসিক ফিও লাগে না।" },
    { title: "কমিশন নেই", desc: "অর্ডার হয় হোয়াটসঅ্যাপে, আপনার আর কাস্টমারের মধ্যে। আমরা পেমেন্ট সামলাই না, ভাগও নিই না।" },
    { title: "শুরুতে কার্ড লাগে না", desc: "ইমেইল বা Google দিয়ে সাইন আপ করলেই চালু। কিছু দিতে হয় না, বাতিলও করতে হয় না।" },
  ],
  laterTitle: "ভবিষ্যৎ নিয়ে সৎ কথা",
  laterBody:
    "ভবিষ্যতে হয়তো ভেরিফায়েড ব্যাজ বা নিজের ডোমেইনের মতো ঐচ্ছিক কিছু যোগ করব। তেমন হলে সেটা পুরোপুরি ঐচ্ছিক থাকবে, চালুর আগে জানানো হবে, আর মূল পেজ ও স্টোর আজকের মতোই ফ্রি থাকবে।",
  faqKicker: "প্রশ্ন-উত্তর",
  faqTitle: "প্রাইসিং নিয়ে প্রশ্ন",
  faq: [
    { q: "সত্যিই কি সারাজীবন ফ্রি?", a: "হ্যাঁ, মূল প্ল্যাটফর্মের জন্য: পাবলিক পেজ, ব্যবসার স্টোর, হোয়াটসঅ্যাপ বাটন, টুলস আর গাইড। এটাই আমাদের প্রতিশ্রুতি।" },
    { q: "কাস্টমার আসতে শুরু করলে কি টাকা চাইবেন?", a: "না। এমন কোনো লিমিট নেই যা আপনাকে পেইড প্ল্যানে ঠেলে দেবে, আর অর্ডারের ওপর কোনো ফিও নেই।" },
    { q: "প্ল্যাটফর্মের খরচ কে চালায়?", a: "আমরা ইচ্ছে করেই খরচ কম রাখি। ভবিষ্যতে কোনো আয় এলে তা আসবে ঐচ্ছিক সুবিধা থেকে, মূল ফিচার আটকে রেখে নয়।" },
  ],
  ctaCreator: "ক্রিয়েটর হিসেবে শুরু করুন",
  ctaBusiness: "ব্যবসা হিসেবে শুরু করুন",
  ctaTools: "ফ্রি টুলস দেখুন",
};

export const pricingCopy: Record<Lang, PricingCopy> = { bn, en };
