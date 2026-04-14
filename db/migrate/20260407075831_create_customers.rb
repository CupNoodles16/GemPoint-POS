class CreateCustomers < ActiveRecord::Migration[8.1]
  def change
    create_table :customers do |t|
      t.string :name, null: false
      t.string :phone 
      t.decimal :total_debt, precision: 10, scale: 2, default: 0
      t.text :notes
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :customers, :name
    add_index :customers, :phone
    add_index :customers, :is_active
  end
end
