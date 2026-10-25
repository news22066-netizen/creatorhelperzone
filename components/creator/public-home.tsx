import { Mail, MessageCircle, Phone } from "lucide-react";
import { getCreatorLinks, getCreatorVideos, type CreatorView } from "@/lib/creator/data";
import { SOCIAL_FIELDS } from "@/lib/creator/links";
import { buildCreatorUrl } from "@/lib/whatsapp";
import { SafeImg } from "@/components/store/safe-img";
import { SocialIcon } from "./social-icon";
import { YoutubeLite } from "./youtube-lite";

const row = "cp-card flex min-h-14 items-center gap-3 rounded-2xl px-4 py-2.5 text-[15px] font-semibold transition-opacity hover:opacity-90";

/** Creator HOME: avatar, name, social icons, tagline, link buttons, About, Get in touch, latest YouTube videos. */
export async function CreatorHome({ view }: { view: CreatorView }) {
  const { profile, displayName, settings } = view;
  const [links, videos] = await Promise.all([getCreatorLinks(profile.id), getCreatorVideos(profile.id)]);

  const socials = SOCIAL_FIELDS.filter((f) => settings.socials[f.key]);
  const wa = profile.whatsapp ? buildCreatorUrl({ whatsapp: profile.whatsapp, name: displayName }) : null;
  const hasContact = Boolean(wa || settings.email || settings.phone || socials.length);
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "?";
  const avatarFallback = (
    <span className="cp-card flex h-24 w-24 items-center justify-center rounded-full text-3xl font-extrabold">{initial}</span>
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3 text-center">
        {profile.avatar_url ? (
          <SafeImg src={profile.avatar_url} alt={displayName} eager fallback={avatarFallback}
            className="h-24 w-24 rounded-full border-2 border-[rgb(var(--cp-text-rgb)/0.3)] object-cover" />
        ) : (
          avatarFallback
        )}
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">{displayName}</h1>
          {profile.full_name && <p className="cp-muted text-sm">@{profile.username}</p>}
        </div>

        {socials.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {socials.map((f) => (
              <li key={f.key}>
                <a href={settings.socials[f.key]!} target="_blank" rel="noopener noreferrer nofollow" aria-label={f.label}
                  className="cp-card flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80">
                  <SocialIcon name={f.key} className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {profile.bio && <p className="cp-muted max-w-sm whitespace-pre-line text-[15px] leading-relaxed">{profile.bio}</p>}

        <div className="flex w-full flex-col gap-2.5 pt-1">
          {hasContact && (
            <a href="#contact" className="cp-btn flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-bold">
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          )}
          {links.map((l) => (
            <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer nofollow ugc"
              className="cp-btn-ghost flex min-h-12 items-center justify-center rounded-full px-5 py-2.5 text-center text-[15px] font-bold">
              {l.title}
            </a>
          ))}
        </div>
      </section>

      {settings.about && (
        <section aria-label="About">
          <h2 className="mb-2 text-lg font-extrabold">About</h2>
          <p className="cp-muted whitespace-pre-line text-[15px] leading-relaxed">{settings.about}</p>
        </section>
      )}

      {hasContact && (
        <section id="contact" aria-label="Get in touch" className="scroll-mt-6">
          <h2 className="mb-3 text-lg font-extrabold">Get in touch</h2>
          <ul className="flex flex-col gap-2.5">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="cp-btn flex min-h-14 items-center gap-3 rounded-2xl px-4 py-2.5 text-[15px] font-bold hover:opacity-90">
                  <MessageCircle className="h-5 w-5 shrink-0" /> WhatsApp
                </a>
              </li>
            )}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`} className={row}><Mail className="h-5 w-5 shrink-0" /><span className="min-w-0 truncate">{settings.email}</span></a></li>
            )}
            {settings.phone && (
              <li><a href={`tel:${settings.phone}`} className={row}><Phone className="h-5 w-5 shrink-0" /><span>{settings.phone}</span></a></li>
            )}
            {socials.map((f) => (
              <li key={f.key}>
                <a href={settings.socials[f.key]!} target="_blank" rel="noopener noreferrer nofollow" className={row}>
                  <SocialIcon name={f.key} className="h-5 w-5 shrink-0" /><span>{f.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {videos.length > 0 && (
        <section aria-label="Latest YouTube videos">
          <h2 className="mb-3 text-lg font-extrabold">Latest YouTube videos</h2>
          <div className="flex flex-col gap-3">
            <YoutubeLite url={videos[0].url} title={videos[0].title || `${displayName} video`} />
            {videos.length > 1 && (
              <ul className="grid grid-cols-2 gap-3">
                {videos.slice(1).map((v) => (
                  <li key={v.id}><YoutubeLite small url={v.url} title={v.title || `${displayName} video`} /></li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {!hasContact && !settings.about && !profile.bio && links.length === 0 && videos.length === 0 && (
        <p className="cp-card rounded-2xl border-dashed px-4 py-6 text-center text-sm">Nothing has been added to this page yet.</p>
      )}
    </div>
  );
}
