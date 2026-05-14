UPDATE products
SET image_url = REPLACE(image_url, '.png', '.webp')
WHERE image_url LIKE '/catalog/products/%.png';

UPDATE catalog_categories
SET image_url = REPLACE(image_url, '.png', '.webp')
WHERE image_url LIKE '/catalog/categories/%.png';
