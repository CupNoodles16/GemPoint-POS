class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.string :barcode
      t.string :sku
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.decimal :cost_price, precision: 10, scale: 2
      t.integer :quantity, default: 0
      t.integer :minimum_stock, default: 0
      t.references :category, foreign_key: true
      t.boolean :is_active, default: true

      t.timestamps
    end
    
    # Add indexes for faster searching
    add_index :products, :barcode, unique: true
    add_index :products, :sku, unique: true
    add_index :products, :name
  end
end