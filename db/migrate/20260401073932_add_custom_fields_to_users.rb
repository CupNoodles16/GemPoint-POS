class AddCustomFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    # Add personal information fields
    add_column :users, :first_name, :string, null: false
    add_column :users, :last_name, :string, null: false
    add_column :users, :phone, :string
    
    # Add role and status fields
    add_column :users, :role, :string, default: 'cashier', null: false
    add_column :users, :active, :boolean, default: true, null: false
    
    # Add indexes
    add_index :users, :phone, unique: true
    add_index :users, :role
  end
end