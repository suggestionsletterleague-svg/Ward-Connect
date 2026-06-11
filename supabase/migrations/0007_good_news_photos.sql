-- ============================================================================
-- Ward Connect — Migration 0007
-- Optional photos for good news submissions and announcements.
-- ============================================================================

alter table public.good_news_submissions
  add column if not exists image_url text;

alter table public.announcements
  add column if not exists image_url text;

-- Public bucket for approved good-news photos (5 MB max, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'good-news-images',
  'good-news-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can view photos once uploaded.
create policy "good_news_images_public_read" on storage.objects
  for select using (bucket_id = 'good-news-images');

-- Members can upload a photo when submitting good news.
create policy "good_news_images_public_upload" on storage.objects
  for insert with check (
    bucket_id = 'good-news-images'
    and (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp', 'gif'))
  );

-- Admins can remove photos (e.g. when deleting a submission).
create policy "good_news_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'good-news-images' and public.is_admin());