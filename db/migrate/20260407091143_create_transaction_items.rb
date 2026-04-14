class CreateTransactionItems < ActiveRecord::Migration[8.1]
  def change
    create_table :transaction_items do |t|
      t.references :transaction, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.decimal :subtotal, precision: 10, scale: 2, null: false

      t.timestamps
    end
    
    # Add indexes for faster searching
    add_index :transaction_items, [:transaction_id, :product_id]
  end
end