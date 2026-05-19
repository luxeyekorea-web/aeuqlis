create table if not exists public.aequalis_landing_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamp with time zone not null default now()
);

alter table public.aequalis_landing_content enable row level security;

drop policy if exists "Public can read aequalis content" on public.aequalis_landing_content;
create policy "Public can read aequalis content"
on public.aequalis_landing_content
for select
using (true);

drop policy if exists "Public can insert aequalis content" on public.aequalis_landing_content;
drop policy if exists "Public can update aequalis content" on public.aequalis_landing_content;

insert into public.aequalis_landing_content (id, content, updated_at)
values (
  'aequalis',
  $json$
  {
    "products": [
      {
        "id": "product-collab-seone",
        "title": "aequalis x seone",
        "category": "collaboration",
        "subtitle": "artisan shoemaker",
        "description": "artisan series",
        "imageUrl": "/images/aequalis/collab-seone.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 10,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-collab-skono",
        "title": "aequalis x SKONO",
        "category": "collaboration",
        "subtitle": "brand collaboration",
        "description": "casual luxury line",
        "imageUrl": "/images/aequalis/collab-skono.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 20,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-collab-hyundai",
        "title": "aequalis x Hyundai Department Store",
        "category": "collaboration",
        "subtitle": "retail exclusive",
        "description": "",
        "imageUrl": "/images/aequalis/collab-hyundai.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 30,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-collab-shinsegae",
        "title": "aequalis x Shinsegae",
        "category": "collaboration",
        "subtitle": "exclusive capsule",
        "description": "",
        "imageUrl": "/images/aequalis/collab-shinsegae.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 40,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-featured-derby",
        "title": "artisan derby",
        "category": "featured",
        "subtitle": "artisan series",
        "description": "",
        "imageUrl": "/images/aequalis/featured-derby.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 10,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-featured-bag",
        "title": "soft structure bag",
        "category": "featured",
        "subtitle": "foundation line",
        "description": "",
        "imageUrl": "/images/aequalis/featured-bag.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 20,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-featured-jacket",
        "title": "minimal shirt jacket",
        "category": "featured",
        "subtitle": "foundation line",
        "description": "",
        "imageUrl": "/images/aequalis/featured-jacket.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 30,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "product-featured-ring",
        "title": "parallel ring",
        "category": "featured",
        "subtitle": "retail exclusive",
        "description": "",
        "imageUrl": "/images/aequalis/featured-ring.png",
        "linkUrl": "#shop",
        "isActive": true,
        "sortOrder": 40,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      }
    ],
    "journals": [
      {
        "id": "journal-parallel-values",
        "title": "on parallel values",
        "summary": "?곕━???꾨룄 ?꾨옒???꾨땶, ?섎???議댁옱?섍린瑜??좏깮?덈떎.",
        "body": "?곕━???꾨룄 ?꾨옒???꾨땶, ?섎???議댁옱?섍린瑜??좏깮?덈떎.",
        "imageUrl": "/images/aequalis/journal-values.png",
        "linkUrl": "#journal",
        "isActive": true,
        "sortOrder": 10,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      },
      {
        "id": "journal-designing-artisans",
        "title": "designing with artisans",
        "summary": "蹂댁씠??寃??덈㉧??媛移? ?μ씤怨쇱쓽 ?묒뾽?쇰줈 ?꾩꽦?쒕떎.",
        "body": "蹂댁씠??寃??덈㉧??媛移? ?μ씤怨쇱쓽 ?묒뾽?쇰줈 ?꾩꽦?쒕떎.",
        "imageUrl": "/images/aequalis/journal-artisans.png",
        "linkUrl": "#journal",
        "isActive": true,
        "sortOrder": 20,
        "createdAt": "2026-05-19T00:00:00.000Z",
        "updatedAt": "2026-05-19T00:00:00.000Z"
      }
    ]
  }
  $json$::jsonb,
  now()
)
on conflict (id) do update
set
  content = excluded.content,
  updated_at = now();
