# db/seeds.rb - Add this after categories are created

puts "\n📦 Creating products..."

# Get category references
beverages = Category.find_by(name: 'Beverages')
snacks = Category.find_by(name: 'Snacks')
canned = Category.find_by(name: 'Canned Goods')
noodles = Category.find_by(name: 'Noodles')
rice_grains = Category.find_by(name: 'Rice & Grains')
dairy = Category.find_by(name: 'Dairy')
personal_care = Category.find_by(name: 'Personal Care')

# If categories don't exist, create them
if beverages.nil?
  puts "   Creating categories first..."
  Category.create!([
    { name: 'Beverages', description: 'Soft drinks, juices, water', its_active: true },
    { name: 'Snacks', description: 'Chips, crackers, biscuits', its_active: true },
    { name: 'Canned Goods', description: 'Canned meats, fish, vegetables', its_active: true },
    { name: 'Noodles', description: 'Instant noodles and pasta', its_active: true },
    { name: 'Rice & Grains', description: 'Rice, oats, grains', its_active: true },
    { name: 'Dairy', description: 'Milk, cheese, eggs', its_active: true },
    { name: 'Personal Care', description: 'Soap, shampoo, hygiene', its_active: true }
  ])
  
  # Re-fetch categories
  beverages = Category.find_by(name: 'Beverages')
  snacks = Category.find_by(name: 'Snacks')
  canned = Category.find_by(name: 'Canned Goods')
  noodles = Category.find_by(name: 'Noodles')
  rice_grains = Category.find_by(name: 'Rice & Grains')
  dairy = Category.find_by(name: 'Dairy')
  personal_care = Category.find_by(name: 'Personal Care')
end

# ============ BEVERAGES (20 products) ============
beverage_products = [
  { name: 'Coca Cola 1.5L', barcode: '4800012345001', price: 65.00, cost_price: 45.00, quantity: 50, minimum_stock: 20, category: beverages },
  { name: 'Coca Cola 330ml Can', barcode: '4800012345002', price: 25.00, cost_price: 18.00, quantity: 120, minimum_stock: 30, category: beverages },
  { name: 'Sprite 1.5L', barcode: '4800012345003', price: 65.00, cost_price: 45.00, quantity: 45, minimum_stock: 20, category: beverages },
  { name: 'Sprite 330ml Can', barcode: '4800012345004', price: 25.00, cost_price: 18.00, quantity: 100, minimum_stock: 30, category: beverages },
  { name: 'Royal 1.5L', barcode: '4800012345005', price: 65.00, cost_price: 45.00, quantity: 40, minimum_stock: 20, category: beverages },
  { name: 'Royal 330ml Can', barcode: '4800012345006', price: 25.00, cost_price: 18.00, quantity: 90, minimum_stock: 30, category: beverages },
  { name: 'Pepsi 1.5L', barcode: '4800012345007', price: 65.00, cost_price: 45.00, quantity: 35, minimum_stock: 20, category: beverages },
  { name: 'Mountain Dew 1.5L', barcode: '4800012345008', price: 70.00, cost_price: 50.00, quantity: 30, minimum_stock: 15, category: beverages },
  { name: 'Mineral Water 1L', barcode: '4800012345009', price: 20.00, cost_price: 12.00, quantity: 200, minimum_stock: 50, category: beverages },
  { name: 'Mineral Water 500ml', barcode: '4800012345010', price: 12.00, cost_price: 8.00, quantity: 300, minimum_stock: 80, category: beverages },
  { name: 'Gatorade Blue 500ml', barcode: '4800012345011', price: 45.00, cost_price: 32.00, quantity: 40, minimum_stock: 15, category: beverages },
  { name: 'Gatorade Red 500ml', barcode: '4800012345012', price: 45.00, cost_price: 32.00, quantity: 38, minimum_stock: 15, category: beverages },
  { name: 'Sting Gold 500ml', barcode: '4800012345013', price: 35.00, cost_price: 25.00, quantity: 55, minimum_stock: 20, category: beverages },
  { name: 'Cobra Energy 500ml', barcode: '4800012345014', price: 40.00, cost_price: 28.00, quantity: 45, minimum_stock: 15, category: beverages },
  { name: 'Nescafe Original 3in1', barcode: '4800012345015', price: 8.00, cost_price: 6.00, quantity: 500, minimum_stock: 100, category: beverages },
  { name: 'Great Taste Coffee 3in1', barcode: '4800012345016', price: 8.00, cost_price: 6.00, quantity: 480, minimum_stock: 100, category: beverages },
  { name: 'Kopiko Black 3in1', barcode: '4800012345017', price: 8.00, cost_price: 6.00, quantity: 450, minimum_stock: 100, category: beverages },
  { name: 'Milo 500g', barcode: '4800012345018', price: 120.00, cost_price: 100.00, quantity: 60, minimum_stock: 20, category: beverages },
  { name: 'Ovaltine 500g', barcode: '4800012345019', price: 115.00, cost_price: 95.00, quantity: 55, minimum_stock: 20, category: beverages },
  { name: 'Fresh Milk 1L', barcode: '4800012345020', price: 85.00, cost_price: 70.00, quantity: 40, minimum_stock: 15, category: dairy }
]

# ============ SNACKS (20 products) ============
snack_products = [
  { name: 'Lays Classic 65g', barcode: '4800098765001', price: 45.00, cost_price: 32.00, quantity: 80, minimum_stock: 25, category: snacks },
  { name: 'Lays Sour Cream 65g', barcode: '4800098765002', price: 45.00, cost_price: 32.00, quantity: 75, minimum_stock: 25, category: snacks },
  { name: 'Piattos Cheese 65g', barcode: '4800098765003', price: 25.00, cost_price: 18.00, quantity: 120, minimum_stock: 30, category: snacks },
  { name: 'Piattos Roast Beef 65g', barcode: '4800098765004', price: 25.00, cost_price: 18.00, quantity: 115, minimum_stock: 30, category: snacks },
  { name: 'Nova 65g', barcode: '4800098765005', price: 25.00, cost_price: 18.00, quantity: 100, minimum_stock: 30, category: snacks },
  { name: 'Nova Cheesy 65g', barcode: '4800098765006', price: 25.00, cost_price: 18.00, quantity: 95, minimum_stock: 30, category: snacks },
  { name: 'Clover Chips 35g', barcode: '4800098765007', price: 15.00, cost_price: 10.00, quantity: 150, minimum_stock: 40, category: snacks },
  { name: 'Clover Cheese 35g', barcode: '4800098765008', price: 15.00, cost_price: 10.00, quantity: 145, minimum_stock: 40, category: snacks },
  { name: 'Chippy 40g', barcode: '4800098765009', price: 12.00, cost_price: 8.00, quantity: 180, minimum_stock: 50, category: snacks },
  { name: 'Chippy BBQ 40g', barcode: '4800098765010', price: 12.00, cost_price: 8.00, quantity: 175, minimum_stock: 50, category: snacks },
  { name: 'Oishi Cracklings 35g', barcode: '4800098765011', price: 10.00, cost_price: 7.00, quantity: 200, minimum_stock: 60, category: snacks },
  { name: 'Oishi Potato Fries 35g', barcode: '4800098765012', price: 10.00, cost_price: 7.00, quantity: 190, minimum_stock: 60, category: snacks },
  { name: 'Cheezy 40g', barcode: '4800098765013', price: 15.00, cost_price: 10.00, quantity: 130, minimum_stock: 35, category: snacks },
  { name: 'Cheezy Pizza 40g', barcode: '4800098765014', price: 15.00, cost_price: 10.00, quantity: 125, minimum_stock: 35, category: snacks },
  { name: 'Tortillos 40g', barcode: '4800098765015', price: 18.00, cost_price: 13.00, quantity: 110, minimum_stock: 30, category: snacks },
  { name: 'V-Cut 40g', barcode: '4800098765016', price: 18.00, cost_price: 13.00, quantity: 105, minimum_stock: 30, category: snacks },
  { name: 'Roller Coaster 40g', barcode: '4800098765017', price: 20.00, cost_price: 14.00, quantity: 90, minimum_stock: 25, category: snacks },
  { name: 'Moby 35g', barcode: '4800098765018', price: 8.00, cost_price: 5.50, quantity: 250, minimum_stock: 80, category: snacks },
  { name: 'Nagaraya Cracker 35g', barcode: '4800098765019', price: 12.00, cost_price: 8.50, quantity: 160, minimum_stock: 45, category: snacks },
  { name: 'Skyflakes 35g', barcode: '4800098765020', price: 10.00, cost_price: 7.00, quantity: 220, minimum_stock: 70, category: snacks }
]

# ============ CANNED GOODS (15 products) ============
canned_products = [
  { name: 'Century Tuna Flakes in Oil', barcode: '4800054321001', price: 35.00, cost_price: 28.00, quantity: 60, minimum_stock: 20, category: canned },
  { name: 'Century Tuna Flakes in Water', barcode: '4800054321002', price: 35.00, cost_price: 28.00, quantity: 55, minimum_stock: 20, category: canned },
  { name: 'Argentina Corned Beef', barcode: '4800054321003', price: 42.00, cost_price: 35.00, quantity: 55, minimum_stock: 20, category: canned },
  { name: 'Argentina Meat Loaf', barcode: '4800054321004', price: 38.00, cost_price: 30.00, quantity: 50, minimum_stock: 18, category: canned },
  { name: 'Purefoods Corned Beef', barcode: '4800054321005', price: 55.00, cost_price: 45.00, quantity: 40, minimum_stock: 15, category: canned },
  { name: 'Purefoods Meat Loaf', barcode: '4800054321006', price: 48.00, cost_price: 38.00, quantity: 45, minimum_stock: 15, category: canned },
  { name: 'Sardines 155g', barcode: '4800054321007', price: 18.00, cost_price: 14.00, quantity: 100, minimum_stock: 30, category: canned },
  { name: 'Sardines in Tomato 155g', barcode: '4800054321008', price: 18.00, cost_price: 14.00, quantity: 95, minimum_stock: 30, category: canned },
  { name: 'Ligo Sardines 155g', barcode: '4800054321009', price: 17.00, cost_price: 13.00, quantity: 110, minimum_stock: 35, category: canned },
  { name: '555 Tuna Flakes', barcode: '4800054321010', price: 32.00, cost_price: 26.00, quantity: 65, minimum_stock: 20, category: canned },
  { name: '555 Tuna Afritada', barcode: '4800054321011', price: 35.00, cost_price: 28.00, quantity: 60, minimum_stock: 20, category: canned },
  { name: 'Spam 340g', barcode: '4800054321012', price: 180.00, cost_price: 155.00, quantity: 30, minimum_stock: 10, category: canned },
  { name: 'Spam Lite 340g', barcode: '4800054321013', price: 180.00, cost_price: 155.00, quantity: 25, minimum_stock: 10, category: canned },
  { name: 'Hunt\'s Pork & Beans', barcode: '4800054321014', price: 28.00, cost_price: 22.00, quantity: 70, minimum_stock: 25, category: canned },
  { name: 'Del Monte Pineapple Chunks', barcode: '4800054321015', price: 45.00, cost_price: 36.00, quantity: 45, minimum_stock: 15, category: canned }
]

# ============ NOODLES (12 products) ============
noodle_products = [
  { name: 'Pancit Canton Original', barcode: '4800032165001', price: 18.00, cost_price: 13.00, quantity: 200, minimum_stock: 50, category: noodles },
  { name: 'Pancit Canton Sweet & Spicy', barcode: '4800032165002', price: 18.00, cost_price: 13.00, quantity: 180, minimum_stock: 50, category: noodles },
  { name: 'Pancit Canton Chilimansi', barcode: '4800032165003', price: 18.00, cost_price: 13.00, quantity: 190, minimum_stock: 50, category: noodles },
  { name: 'Nissin Cup Noodles', barcode: '4800032165004', price: 25.00, cost_price: 19.00, quantity: 150, minimum_stock: 40, category: noodles },
  { name: 'Nissin Ramen Beef', barcode: '4800032165005', price: 15.00, cost_price: 11.00, quantity: 160, minimum_stock: 45, category: noodles },
  { name: 'Nissin Ramen Chicken', barcode: '4800032165006', price: 15.00, cost_price: 11.00, quantity: 155, minimum_stock: 45, category: noodles },
  { name: 'Lucky Me! Beef', barcode: '4800032165007', price: 12.00, cost_price: 9.00, quantity: 220, minimum_stock: 60, category: noodles },
  { name: 'Lucky Me! Chicken', barcode: '4800032165008', price: 12.00, cost_price: 9.00, quantity: 215, minimum_stock: 60, category: noodles },
  { name: 'Lucky Me! Spicy', barcode: '4800032165009', price: 12.00, cost_price: 9.00, quantity: 210, minimum_stock: 60, category: noodles },
  { name: 'Indomie Mi Goreng', barcode: '4800032165010', price: 15.00, cost_price: 11.00, quantity: 140, minimum_stock: 40, category: noodles },
  { name: 'Mama Shrimp Noodles', barcode: '4800032165011', price: 12.00, cost_price: 9.00, quantity: 170, minimum_stock: 50, category: noodles },
  { name: 'Mama Tom Yum', barcode: '4800032165012', price: 12.00, cost_price: 9.00, quantity: 165, minimum_stock: 50, category: noodles }
]

# ============ RICE & GRAINS (8 products) ============
rice_products = [
  { name: 'Sinandomeng Rice 5kg', barcode: '4800076543001', price: 250.00, cost_price: 220.00, quantity: 40, minimum_stock: 10, category: rice_grains },
  { name: 'Sinandomeng Rice 10kg', barcode: '4800076543002', price: 480.00, cost_price: 430.00, quantity: 25, minimum_stock: 8, category: rice_grains },
  { name: 'Jasmine Rice 5kg', barcode: '4800076543003', price: 280.00, cost_price: 250.00, quantity: 30, minimum_stock: 8, category: rice_grains },
  { name: 'Dinorado Rice 5kg', barcode: '4800076543004', price: 300.00, cost_price: 270.00, quantity: 25, minimum_stock: 8, category: rice_grains },
  { name: 'Oats Rolled 500g', barcode: '4800076543005', price: 65.00, cost_price: 52.00, quantity: 50, minimum_stock: 15, category: rice_grains },
  { name: 'Quinoa 500g', barcode: '4800076543006', price: 180.00, cost_price: 150.00, quantity: 20, minimum_stock: 5, category: rice_grains },
  { name: 'Corn Grits 1kg', barcode: '4800076543007', price: 45.00, cost_price: 36.00, quantity: 35, minimum_stock: 10, category: rice_grains },
  { name: 'Monggo Beans 500g', barcode: '4800076543008', price: 35.00, cost_price: 28.00, quantity: 45, minimum_stock: 12, category: rice_grains }
]

# ============ DAIRY (8 products) ============
dairy_products = [
  { name: 'Bear Brand Milk 900g', barcode: '4800087654001', price: 120.00, cost_price: 100.00, quantity: 35, minimum_stock: 12, category: dairy },
  { name: 'Bear Brand Milk 400g', barcode: '4800087654002', price: 55.00, cost_price: 45.00, quantity: 50, minimum_stock: 15, category: dairy },
  { name: 'Alaska Milk 900g', barcode: '4800087654003', price: 115.00, cost_price: 95.00, quantity: 30, minimum_stock: 10, category: dairy },
  { name: 'Nestle Cream 250ml', barcode: '4800087654004', price: 55.00, cost_price: 45.00, quantity: 40, minimum_stock: 12, category: dairy },
  { name: 'Cheese Slices 200g', barcode: '4800087654005', price: 85.00, cost_price: 70.00, quantity: 35, minimum_stock: 10, category: dairy },
  { name: 'Butter 200g', barcode: '4800087654006', price: 65.00, cost_price: 52.00, quantity: 30, minimum_stock: 8, category: dairy },
  { name: 'Yogurt Drink 150ml', barcode: '4800087654007', price: 25.00, cost_price: 19.00, quantity: 60, minimum_stock: 20, category: dairy },
  { name: 'Eggs 1 dozen', barcode: '4800087654008', price: 85.00, cost_price: 72.00, quantity: 80, minimum_stock: 25, category: dairy }
]

# ============ PERSONAL CARE (10 products) ============
personal_care_products = [
  { name: 'Safeguard Soap', barcode: '4800098763001', price: 25.00, cost_price: 20.00, quantity: 100, minimum_stock: 30, category: personal_care },
  { name: 'Safeguard Body Wash 200ml', barcode: '4800098763002', price: 85.00, cost_price: 70.00, quantity: 45, minimum_stock: 15, category: personal_care },
  { name: 'Head & Shoulders Shampoo 170ml', barcode: '4800098763003', price: 95.00, cost_price: 78.00, quantity: 40, minimum_stock: 12, category: personal_care },
  { name: 'Sunsilk Shampoo 170ml', barcode: '4800098763004', price: 90.00, cost_price: 74.00, quantity: 42, minimum_stock: 12, category: personal_care },
  { name: 'Colgate Toothpaste 150ml', barcode: '4800098763005', price: 55.00, cost_price: 44.00, quantity: 65, minimum_stock: 20, category: personal_care },
  { name: 'Closeup Toothpaste 150ml', barcode: '4800098763006', price: 55.00, cost_price: 44.00, quantity: 60, minimum_stock: 20, category: personal_care },
  { name: 'Toothbrush', barcode: '4800098763007', price: 25.00, cost_price: 18.00, quantity: 80, minimum_stock: 25, category: personal_care },
  { name: 'Tissue Paper 100s', barcode: '4800098763008', price: 45.00, cost_price: 36.00, quantity: 55, minimum_stock: 15, category: personal_care },
  { name: 'Facial Wash 100ml', barcode: '4800098763009', price: 120.00, cost_price: 98.00, quantity: 30, minimum_stock: 10, category: personal_care },
  { name: 'Deodorant Stick', barcode: '4800098763010', price: 65.00, cost_price: 52.00, quantity: 50, minimum_stock: 15, category: personal_care }
]

# Combine all products
all_products = beverage_products + snack_products + canned_products + noodle_products + rice_products + dairy_products + personal_care_products

# Create or update products
created_count = 0
updated_count = 0

all_products.each do |product_data|
  product = Product.find_or_initialize_by(barcode: product_data[:barcode])
  
  if product.new_record?
    product.assign_attributes(product_data)
    product.is_active = true
    product.save!
    created_count += 1
  else
    # Update existing product prices and quantities
    product.update(
      price: product_data[:price],
      cost_price: product_data[:cost_price],
      quantity: product_data[:quantity],
      minimum_stock: product_data[:minimum_stock]
    )
    updated_count += 1
  end
end

puts "✅ Products: #{Product.count} total (#{created_count} new, #{updated_count} updated)"


# Display product count by category
puts "\n📊 Products by category:"
Category.all.each do |cat|
  count = Product.where(category: cat).count
  puts "   #{cat.name}: #{count} products"
end