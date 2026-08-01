-- Políticas de segurança para o bucket privado 'avatars'
-- Qualquer pessoa pode visualizar avatares (perfis são públicos)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- Usuários autenticados podem fazer upload apenas na própria pasta
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '/%')
);

-- Usuários autenticados podem atualizar apenas seus próprios arquivos
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '/%')
);

-- Usuários autenticados podem excluir apenas seus próprios arquivos
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '/%')
);