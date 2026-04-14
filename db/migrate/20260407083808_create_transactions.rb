class CreateTransactions < ActiveRecord::Migration[8.1]
  def change
    create_table :transactions do |t|
      t.string :invoice_number, null: false
      t.references :user, null: false, foreign_key: true
      t.references :customer, foreign_key: true
      t.datetime :transaction_date, null: false
      t.decimal :subtotal, precision: 10, scale: 2, default: 0
      t.decimal :total_amount, precision: 10, scale: 2, default: 0
      t.text :notes
      t.string :status, default: 'completed'

      t.timestamps
    end
    
    # Add indexes for searching
    add_index :transactions, :invoice_number, unique: true
    add_index :transactions, :transaction_date
    add_index :transactions, :status
  end
end