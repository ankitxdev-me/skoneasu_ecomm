-- Insert Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Rings', 'rings', 'Elegant rings for every occasion', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'),
('Earrings', 'earrings', 'Stunning earrings that sparkle', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'),
('Necklaces', 'necklaces', 'Beautiful necklaces to adorn you', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'),
('Bracelets', 'bracelets', 'Charming bracelets for your wrist', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800')
ON CONFLICT (slug) DO NOTHING;
