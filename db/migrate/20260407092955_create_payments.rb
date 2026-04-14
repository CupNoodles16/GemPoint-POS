class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :transaction, null: false, foreign_key: true
      t.string :payment_method, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :reference_number
      t.string :status, default: 'completed'

      t.timestamps
    end
    
    # Add indexes for faster searching
    add_index :payments, :payment_method
    add_index :payments, :reference_number
    add_index :payments, :statusa
  end
end