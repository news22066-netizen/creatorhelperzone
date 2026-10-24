-- Reserve "cookies" (new /cookies route). Keep in sync with RESERVED_USERNAMES in lib/utils/username.ts.
create or replace function public.is_reserved_username(p_username text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(p_username, '')) = any (array[
    'admin','login','signup','register','logout','dashboard','api','tools','guides','guide',
    'trending','faq','faqs','store','collaboration','notifications','c','b','app','www',
    'static','_next','menu','settings','auth','profile','support','help','about','contact',
    'privacy','terms','cookies','blog','news','search','explore','reels','video','home','index',
    'root','null','undefined','test','robots','sitemap','favicon'
  ]);
$$;
